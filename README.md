# Crawler Site [ ![Codeship Status for CrawlerSite/CrawlerSite.Backend](https://app.codeship.com/projects/7bcc6350-1248-0135-9dbc-4a1a20133278/status?branch=master)](https://app.codeship.com/projects/217002)
easy way to truly understand your web and mobile site visitors. 

## Developing Mode
You need execute some steps to develop in this project. Remember if you want to develop on Crawler Site (Fron and back) you need run first this project

### Install MongoDB

First, You need have installed MongoDB, we recommend use our installation script if you have Windows stored on /ToolsForWindows/InstallMongoDB.cmd

**Important**: This script needs administration permission.

If you prefer install your own MongoDB when you restart your computer you need execute engine, also we have a script to execute it, stored on /ToolsForWindows/RunMongoServer.cmd

### Packages installation

Second, Now you need execute a Console in this path and execute following command:

> npm install

### Configuration File

Create a file named "default.json" on /config/ folder

{
    "FlingerSecretJWT": "CrawlerSiteIsCool",
    "MongoConnectionString": "mongodb://127.0.0.1:27017/Flinger",
    "NotificationMailUser": "developer@crawlersite.com",
    "NotificationMailPassword": "umm63DouoNWVcVAjmlSB",
    "DebugMailUser": "developer@crawlersite.com",
    "DebugMailPassword": "umm63DouoNWVcVAjmlSB",
    "MailDomain": "smtp.zoho.com",
    "MailPort": "465",
    "MailEncryption": "STARTTLS",
    "StripePrivateKey": "sk_test_yQpMkXfn1OM6GUwXcFjFFDKX"
}

### Run Server

After install MongoDB and packages you can run this local server with:

> npm run start

## Production

If you trying to run on Virtual Machine install forever package:

> npm install -g forever

### Start server to listen
We decide to use 3500 internal port to redirect to 443 (SSL), run:

> cd CrawlerSite.Backend
> sudo forever start forever/production.json

### Stop apps

> sudo forever stopall