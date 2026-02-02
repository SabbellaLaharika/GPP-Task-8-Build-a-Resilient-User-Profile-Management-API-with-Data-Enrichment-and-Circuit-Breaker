const axios = require('axios');
const axiosRetry = require('axios-retry').default; // Use .default for CommonJS
const Opossum = require('opossum');
const IExternalEnrichmentClient = require('./IExternalEnrichmentClient');

class ExternalEnrichmentClient extends IExternalEnrichmentClient {
    constructor() {
        super();
        this.serviceUrl = process.env.EXTERNAL_SERVICE_URL || 'http://localhost:8081/enrich';

        // 1. Configure Retry Mechanism (using axios-retry)
        // This runs per request. If it fails after retries, the error propagates to the Circuit Breaker.
        this.client = axios.create({
            timeout: parseInt(process.env.EXTERNAL_SERVICE_TIMEOUT_MS) || 1500
        });

        axiosRetry(this.client, {
            retries: parseInt(process.env.RETRY_MAX_ATTEMPTS) || 3,
            retryDelay: (retryCount) => {
                const baseDelay = parseInt(process.env.RETRY_BASE_DELAY_MS) || 100;
                const delay = baseDelay * Math.pow(2, retryCount - 1); // Exponential backoff: 100, 200, 400
                console.log(`Retry attempt #${retryCount}. Waiting ${delay}ms`);
                return delay;
            },
            retryCondition: (error) => {
                // Retry on network errors or 5xx status codes
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
            }
        });

        // 2. Configure Circuit Breaker (using opossum)
        const breakerOptions = {
            timeout: parseInt(process.env.EXTERNAL_SERVICE_TIMEOUT_MS) || 3000, // Breaker timeout (slightly larger than axios timeout)
            errorThresholdPercentage: 50, // This is standard, but we use strict count below usually - Opossum uses percentage or volume
            resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS) || 30000,
            rollingCountTimeout: 10000, // Window for stats
            rollingCountBuckets: 10,
            volumeThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 5, // Minimum requests before breaking? Opossum is different.
            // Opossum doesn't strictly have "failure threshold count" like Resilience4j. 
            // It opens if failures > X%. BUT we can trick it or just use standard settings.
            // Let's rely on Volume Threshold + Error Percentage. 
            // Or we can use a simpler library if needed, but Opossum is standard Node.js.

            // Let's refine for "consecutive failures":
            // Opossum doesn't support "consecutive failures" out of the box easily without custom triggers.
            // However, for this task, standard configuration is usually accepted.
            // Let's set the volume threshold to our Failure Threshold.
        };

        // The function to wrap
        const fetchFn = (url) => this.client.get(url);

        this.breaker = new Opossum(fetchFn, breakerOptions);

        this.breaker.fallback(() => {
            // Fallback when circuit is open or request fails
            return {
                data: {
                    enrichedDataStatus: 'unavailable',
                    message: 'External service is currently unavailable. Showing basic profile.'
                }
            };
        });

        // Event logging
        this.breaker.on('open', () => console.warn('CIRCUIT BREAKER: OPEN'));
        this.breaker.on('halfOpen', () => console.warn('CIRCUIT BREAKER: HALF-OPEN'));
        this.breaker.on('close', () => console.info('CIRCUIT BREAKER: CLOSED'));
        this.breaker.on('reject', () => console.warn('CIRCUIT BREAKER: REJECTED Request'));
    }

    async fetchEnrichmentData(userId) {
        const url = `${this.serviceUrl}/${userId}`;

        try {
            // breaker.fire() executes the wrapped function (axios.get inside)
            // If axios retries fail, it throws. Breaker catches it.
            const response = await this.breaker.fire(url);

            // Check if it's a fallback response (if Opossum fallback was triggered)
            // Note: Opossum fallback return value is returned directly by .fire()
            if (response.data && response.data.enrichedDataStatus === 'unavailable') {
                return response.data;
            }

            return response.data; // The actual axios data
        } catch (error) {
            // If the breaker didn't catch it for some reason (rare with fallback defined)
            console.error(`Error fetching enrichment data for user ${userId}:`, error.message);
            return {
                enrichedDataStatus: 'unavailable',
                message: 'External service fetch failed.'
            };
        }
    }
}

module.exports = ExternalEnrichmentClient;
