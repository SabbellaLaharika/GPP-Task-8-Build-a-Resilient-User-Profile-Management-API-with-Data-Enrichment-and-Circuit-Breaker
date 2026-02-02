class IExternalEnrichmentClient {
    /**
     * Fetches enrichment data for a user.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Object>} - The enriched data (recentActivity, loyaltyScore).
     * @throws {Error} - If the fetching fails or circuit is open.
     */
    async fetchEnrichmentData(userId) { throw new Error("Not implemented"); }
}

module.exports = IExternalEnrichmentClient;
