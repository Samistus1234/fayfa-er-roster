# 🚀 Google Cloud Deployment Guide - Fayfa ER Roster Management System

This comprehensive guide will help you deploy the Fayfa ER Roster application to Google Cloud Platform for full production functionality with email notifications.

## 🌟 Google Cloud Deployment Options

### Option 1: Google Cloud App Engine (Recommended)

Google App Engine offers serverless deployment with automatic scaling and zero server management.

**Benefits:**
- Automatic scaling and load balancing
- Built-in security and SSL certificates
- Pay-per-use pricing model
- Email service integration
- Professional hosting with 99.95% uptime SLA

**Steps:**
1. Create Google Cloud account at [cloud.google.com](https://cloud.google.com)
2. Install Google Cloud CLI: [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. Follow deployment steps below

**Cost:** Free tier + ~$10-30/month for medium usage
**Deploy Time:** 10-15 minutes
**Your app will be available at:** `https://[project-id].uc.r.appspot.com`

### Option 2: Google Cloud Compute Engine

For full control over server configuration and custom setups.

**Benefits:**
- Complete server control
- Custom environment configuration
- SSH access for troubleshooting
- Can install additional software
- Ideal for complex requirements

**Steps:**
1. Create VM instance using Google Cloud Console
2. Install Node.js and dependencies
3. Configure PM2 for process management
4. Setup Nginx reverse proxy (optional)

**Cost:** ~$25-50/month for a dedicated instance
**Deploy Time:** 20-30 minutes
**Your app will be available at:** `http://[external-ip]:8080`

---

## 📋 Prerequisites

Before deploying to Google Cloud, ensure you have:

1. **Google Cloud Account** - [Sign up here](https://cloud.google.com/) (requires credit card for verification)
2. **Google Cloud CLI** - [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Gmail Account** - For email notifications (App Password required)
4. **Billing Enabled** - Google Cloud requires billing to be enabled for deployments

---

## 🎯 Step-by-Step: App Engine Deployment

### Step 1: Setup Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create fayfa-er-roster-prod --name="Fayfa ER Roster"

# Set the project as active
gcloud config set project fayfa-er-roster-prod

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Initialize App Engine (choose us-central1 region)
gcloud app create --region=us-central1
```

### Step 2: Configure App Engine

The `app.yaml` file is already included in your project. Update the email settings:

```yaml
env_variables:
  EMAIL_USER: your-actual-email@gmail.com
  EMAIL_PASS: your-16-character-app-password
```

### Step 3: Setup Gmail App Password

1. **Enable 2-Factor Authentication:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → Enable

2. **Generate App Password:**
   - Security → 2-Step Verification → App passwords
   - Select "Mail" application
   - Copy the 16-character password

3. **Update app.yaml:**
   Replace `your-email@gmail.com` and `your-gmail-app-password` with your actual credentials

### Step 4: Deploy to App Engine

```bash
# Navigate to your project directory
cd /path/to/fayfa-er-roster

# Deploy the application
gcloud app deploy

# View your deployed app
gcloud app browse
```

### Step 5: Test Your Deployment

Your app will be available at: `https://fayfa-er-roster-prod.uc.r.appspot.com`

Test the notification system:
1. Go to your app URL
2. Click "Notifications" → "Create Test Duties"
3. Click "Check Now" to verify email notifications work

---

## 🖥️ Alternative: Compute Engine Deployment

### Step 1: Create VM Instance

```bash
# Create a VM instance
gcloud compute instances create fayfa-er-roster \
    --zone=us-central1-a \
    --machine-type=e2-medium \
    --image=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=20GB \
    --tags=http-server,https-server

# Allow HTTP traffic on port 8080
gcloud compute firewall-rules create allow-http-8080 \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow port 8080"
```

### Step 2: Setup the VM

```bash
# SSH into the instance
gcloud compute ssh fayfa-er-roster --zone=us-central1-a

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clone your repository
git clone https://github.com/Samistus1234/fayfa-er-roster.git
cd fayfa-er-roster

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Create environment file
cp .env.example .env
nano .env  # Edit with your email credentials
```

### Step 3: Start the Application

```bash
# Start with PM2
pm2 start src/app.js --name "fayfa-er-roster"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it shows you

# Check status
pm2 status
```

Your app will be available at: `http://[VM-EXTERNAL-IP]:8080`

---

## 🔒 Security & Production Setup

### Enable HTTPS (App Engine)

App Engine automatically provides HTTPS. Your app will be accessible at:
- `https://fayfa-er-roster-prod.uc.r.appspot.com` (secure)
- HTTP requests are automatically redirected to HTTPS

### Custom Domain (Optional)

```bash
# Map your custom domain
gcloud app domain-mappings create your-domain.com

# Verify domain ownership in Google Search Console
# DNS records will be provided by Google Cloud
```

### Environment Variables Security

For production, use Google Secret Manager:

```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "your-email@gmail.com" | gcloud secrets create email-user --data-file=-
echo -n "your-app-password" | gcloud secrets create email-pass --data-file=-

# Update app.yaml to use secrets
# env_variables:
#   EMAIL_USER: projects/fayfa-er-roster-prod/secrets/email-user/versions/latest
#   EMAIL_PASS: projects/fayfa-er-roster-prod/secrets/email-pass/versions/latest
```

---

## 📊 Monitoring & Maintenance

### View Application Logs

```bash
# View recent logs
gcloud app logs tail -s default

# View logs from specific time
gcloud logging read "resource.type=gae_app" --limit=50
```

### Monitor Performance

1. **Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com)
2. **App Engine Dashboard:** View traffic, errors, and performance
3. **Cloud Monitoring:** Set up alerts for downtime or errors

### Update Your App

```bash
# Make changes to your code
# Commit changes to git
git add .
git commit -m "Update description"
git push origin main

# Deploy updates
gcloud app deploy
```

---

## 💰 Cost Management

### App Engine Pricing

- **Free Tier:** 28 instance hours per day
- **Standard Environment:** ~$0.05-0.10 per instance hour
- **Traffic:** First 1GB free, then ~$0.12/GB
- **Storage:** First 5GB free

### Estimated Monthly Costs

- **Low usage (few users):** $0-10/month
- **Medium usage (daily users):** $10-30/month
- **High usage (constant traffic):** $30-100/month

### Cost Optimization Tips

1. **Use automatic scaling** in app.yaml
2. **Set min_instances: 0** for cost savings (slower cold starts)
3. **Monitor usage** in Google Cloud Console
4. **Set billing alerts** to avoid surprises

---

## 🧪 Testing Your Production App

### 1. Basic Functionality Test

```bash
# Test homepage
curl https://fayfa-er-roster-prod.uc.r.appspot.com/

# Test API endpoints
curl https://fayfa-er-roster-prod.uc.r.appspot.com/api/doctors
curl https://fayfa-er-roster-prod.uc.r.appspot.com/api/roster/2025/06
```

### 2. Complete Feature Test

1. ✅ Dashboard loads with June 2025 data
2. ✅ Analytics show correct duty counts
3. ✅ Workload analysis displays
4. ✅ Fairness metrics calculate properly
5. ✅ Consultation log opens and functions
6. ✅ Export buttons work (CSV/PDF)
7. ✅ Add doctor functionality
8. ✅ Add roster entry works
9. ✅ Email notifications send successfully

### 3. Performance Test

```bash
# Install Apache Bench for load testing
sudo apt install apache2-utils

# Basic load test (100 requests, 10 concurrent)
ab -n 100 -c 10 https://fayfa-er-roster-prod.uc.r.appspot.com/
```

---

## 🔧 Troubleshooting

### Common Deployment Issues

1. **Build fails:**
   ```bash
   # Check build logs
   gcloud builds log
   
   # Verify Node.js version in package.json
   "engines": { "node": ">=18.0.0" }
   ```

2. **App won't start:**
   ```bash
   # Check application logs
   gcloud app logs tail -s default
   
   # Verify PORT environment variable usage
   const PORT = process.env.PORT || 3000;
   ```

3. **Email notifications fail:**
   ```bash
   # Verify environment variables
   gcloud app versions describe LATEST --service=default
   
   # Test email credentials locally first
   ```

### Performance Issues

1. **Slow loading:**
   - Enable gzip compression
   - Optimize image sizes
   - Use CDN for static assets

2. **Memory issues:**
   - Monitor memory usage in Cloud Console
   - Increase instance class if needed
   - Optimize data loading

### Getting Help

- **Google Cloud Support:** [cloud.google.com/support](https://cloud.google.com/support)
- **App Engine Documentation:** [cloud.google.com/appengine/docs](https://cloud.google.com/appengine/docs)
- **Community Support:** [stackoverflow.com/questions/tagged/google-app-engine](https://stackoverflow.com/questions/tagged/google-app-engine)

---

## ✅ Final Checklist

Before going live:

- [ ] Google Cloud project created and billing enabled
- [ ] Gmail App Password generated and configured
- [ ] app.yaml file updated with correct email credentials
- [ ] Application deployed successfully to App Engine
- [ ] All features tested in production environment
- [ ] Email notifications verified working
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up
- [ ] Team access granted (if needed)

Your Fayfa ER Roster Management System will be fully operational with:

- ✅ Professional Google Cloud hosting
- ✅ Automatic HTTPS/SSL security
- ✅ Working email notifications
- ✅ Automatic scaling and load balancing
- ✅ 99.95% uptime SLA
- ✅ Global content delivery
- ✅ Real-time monitoring and logging

**🚀 Your app will be accessible at:**
`https://fayfa-er-roster-prod.uc.r.appspot.com`

---

## 🚀 Quick Start Summary

1. **Create Google Cloud project:**
   ```bash
   gcloud projects create fayfa-er-roster-prod
   gcloud config set project fayfa-er-roster-prod
   gcloud app create --region=us-central1
   ```

2. **Setup Gmail App Password:**
   - Enable 2FA in Google Account
   - Generate App Password for Mail
   - Update `app.yaml` with credentials

3. **Deploy:**
   ```bash
   gcloud app deploy
   gcloud app browse
   ```

4. **Test email notifications in production**

**Result:** Professional, scalable ER roster management system with working email notifications!

---

## 📞 Need Help?

- **Email not working?** Double-check Gmail App Password setup
- **Deployment fails?** Verify billing is enabled and gcloud CLI is authenticated
- **App errors?** Check logs with `gcloud app logs tail -s default`

**Estimated total setup time:** 30-60 minutes
**Monthly cost:** $10-30 for typical hospital usage

Your Fayfa ER Roster application will be live at:
**`https://fayfa-er-roster-prod.uc.r.appspot.com`**