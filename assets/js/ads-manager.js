// assets/js/ads-manager.js
class AdsManager {
    constructor() {
        this.campaigns = [];
        this.analyticsData = [];
        this.init();
    }

    async init() {
        console.log('📊 Ads Manager initializing...');
        await this.checkAuth();
        await this.loadCampaigns();
        await this.loadAnalytics();
        this.initChart();
    }

    async checkAuth() {
        if (!isLoggedIn() || !isAdmin()) {
            document.getElementById('authMessage').style.display = 'block';
            document.getElementById('adsContent').style.display = 'none';
            return false;
        }
        
        document.getElementById('authMessage').style.display = 'none';
        document.getElementById('adsContent').style.display = 'block';
        return true;
    }

    async loadCampaigns() {
        try {
            const campaigns = await clientDB.getAdCampaigns();
            this.campaigns = campaigns || [];
            this.renderCampaigns();
            this.updateStats();
        } catch (error) {
            console.error('Error loading campaigns:', error);
            this.loadCampaignsFromLocalStorage();
        }
    }

    loadCampaignsFromLocalStorage() {
        const stored = localStorage.getItem('edutech_ad_campaigns');
        this.campaigns = stored ? JSON.parse(stored) : [];
        this.renderCampaigns();
        this.updateStats();
    }

    renderCampaigns() {
        const container = document.getElementById('campaignsList');
        
        if (this.campaigns.length === 0) {
            container.innerHTML = `
                <div class="no-campaigns" style="text-align: center; padding: 3rem; color: var(--gray);">
                    <i class="fas fa-ad" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No Active Campaigns</h3>
                    <p>Create your first ad campaign to start monetizing</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.campaigns.map(campaign => `
            <div class="campaign-item">
                <div class="campaign-header">
                    <div class="campaign-name">${campaign.name}</div>
                    <div class="campaign-status ${campaign.status === 'active' ? 'status-active' : 'status-paused'}">
                        ${campaign.status === 'active' ? 'Active' : 'Paused'}
                    </div>
                </div>
                <div class="campaign-info">
                    <div style="color: var(--gray); margin-bottom: 0.5rem;">
                        <strong>Type:</strong> ${this.formatAdType(campaign.type)} | 
                        <strong>Budget:</strong> $${campaign.budget}/day
                    </div>
                    <div style="color: var(--gray); font-size: 0.9rem;">
                        ${campaign.targetUrl}
                    </div>
                </div>
                <div class="campaign-stats">
                    <div class="campaign-stat">
                        <div class="stat-value">${campaign.impressions || 0}</div>
                        <div class="stat-title">Impressions</div>
                    </div>
                    <div class="campaign-stat">
                        <div class="stat-value">${campaign.clicks || 0}</div>
                        <div class="stat-title">Clicks</div>
                    </div>
                    <div class="campaign-stat">
                        <div class="stat-value">$${campaign.revenue || '0.00'}</div>
                        <div class="stat-title">Revenue</div>
                    </div>
                </div>
                <div class="campaign-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-small ${campaign.status === 'active' ? 'btn-warning' : 'btn-success'}" 
                            onclick="adsManager.toggleCampaign('${campaign.id}')">
                        ${campaign.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="adsManager.editCampaign('${campaign.id}')">
                        Edit
                    </button>
                    <button class="btn btn-small" style="background: var(--error);" 
                            onclick="adsManager.deleteCampaign('${campaign.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatAdType(type) {
        const types = {
            'banner': 'Banner',
            'sidebar': 'Sidebar',
            'popup': 'Popup',
            'video': 'Video'
        };
        return types[type] || type;
    }

    updateStats() {
        const totalImpressions = this.campaigns.reduce((sum, camp) => sum + (camp.impressions || 0), 0);
        const totalRevenue = this.campaigns.reduce((sum, camp) => sum + (parseFloat(camp.revenue) || 0), 0);
        const activeCampaigns = this.campaigns.filter(camp => camp.status === 'active').length;
        const totalClicks = this.campaigns.reduce((sum, camp) => sum + (camp.clicks || 0), 0);
        const clickRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

        document.getElementById('totalImpressions').textContent = totalImpressions.toLocaleString();
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('activeCampaigns').textContent = activeCampaigns;
        document.getElementById('clickRate').textContent = `${clickRate}%`;
    }

    async loadAnalytics() {
        // Simulate analytics data
        this.analyticsData = this.generateDemoAnalytics();
    }

    generateDemoAnalytics() {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString(),
                impressions: Math.floor(Math.random() * 1000) + 500,
                clicks: Math.floor(Math.random() * 100) + 20,
                revenue: (Math.random() * 50 + 10).toFixed(2)
            });
        }
        return data;
    }

    initChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        const dates = this.analyticsData.map(d => d.date);
        const impressions = this.analyticsData.map(d => d.impressions);
        const clicks = this.analyticsData.map(d => d.clicks);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Impressions',
                        data: impressions,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Clicks',
                        data: clicks,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#f1f5f9'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    showAddCampaignModal() {
        document.getElementById('addCampaignModal').style.display = 'block';
        document.getElementById('campaignForm').reset();
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async saveCampaign() {
        const form = document.getElementById('campaignForm');
        const formData = new FormData(form);
        
        const campaign = {
            id: 'camp_' + Date.now(),
            name: document.getElementById('campaignName').value,
            type: document.getElementById('adType').value,
            content: document.getElementById('adContent').value,
            budget: parseFloat(document.getElementById('budget').value),
            targetUrl: document.getElementById('targetUrl').value,
            status: 'active',
            impressions: 0,
            clicks: 0,
            revenue: 0,
            createdAt: new Date().toISOString()
        };

        try {
            // Try to save to Firebase
            await clientDB.saveAdCampaign(campaign);
        } catch (error) {
            // Fallback to localStorage
            this.saveCampaignToLocalStorage(campaign);
        }

        this.campaigns.push(campaign);
        this.renderCampaigns();
        this.updateStats();
        this.closeModal('addCampaignModal');
        
        alert('Campaign created successfully!');
    }

    saveCampaignToLocalStorage(campaign) {
        const campaigns = JSON.parse(localStorage.getItem('edutech_ad_campaigns') || '[]');
        campaigns.push(campaign);
        localStorage.setItem('edutech_ad_campaigns', JSON.stringify(campaigns));
    }

    toggleCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (campaign) {
            campaign.status = campaign.status === 'active' ? 'paused' : 'active';
            this.renderCampaigns();
            this.updateStats();
            this.saveCampaigns();
        }
    }

    editCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (campaign) {
            document.getElementById('campaignName').value = campaign.name;
            document.getElementById('adType').value = campaign.type;
            document.getElementById('adContent').value = campaign.content;
            document.getElementById('budget').value = campaign.budget;
            document.getElementById('targetUrl').value = campaign.targetUrl;
            
            // Store the campaign ID for update
            document.getElementById('campaignForm').dataset.editing = campaignId;
            document.getElementById('addCampaignModal').style.display = 'block';
        }
    }

    deleteCampaign(campaignId) {
        if (confirm('Are you sure you want to delete this campaign?')) {
            this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
            this.renderCampaigns();
            this.updateStats();
            this.saveCampaigns();
        }
    }

    saveCampaigns() {
        localStorage.setItem('edutech_ad_campaigns', JSON.stringify(this.campaigns));
    }

    generateAdCode() {
        const adCode = `<!-- EduTech Ad Code -->
<div class="edutech-ad" data-zone="sidebar">
    <script src="assets/js/ad-renderer.js"></script>
</div>`;
        
        prompt('Copy this ad code and paste it in your website:', adCode);
    }

    showAdSettings() {
        alert('Ad settings feature coming soon!');
    }

    viewReports() {
        alert('Detailed reports feature coming soon!');
    }
}

// Initialize Ads Manager
const adsManager = new AdsManager();

// Global functions for HTML onclick events
window.showAddCampaignModal = () => adsManager.showAddCampaignModal();
window.closeModal = (modalId) => adsManager.closeModal(modalId);
window.saveCampaign = () => adsManager.saveCampaign();
window.generateAdCode = () => adsManager.generateAdCode();
window.showAdSettings = () => adsManager.showAdSettings();
window.viewReports = () => adsManager.viewReports();
