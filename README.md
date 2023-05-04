# URL Shortener service

## Prerequisites

- Node.js 14.15.4 or later
- Yarn 1.22.10 or later

## Getting Started

### Setup environment variables

Create a `.env.local` file in the root directory of the project and add the following environment variables:

```
DB_NAME=<your_db_name>
MONGODB_URI=<your_mongodb_uri>

API_KEY=<a-long-random-string>
HOST=<your_host_for_generate_short_links>

USERNAME=<dashboard_username>
PASSWORD=<dashboard_password>

TOKEN_SECRET=<long_secret_for_jwt_sign>
```

Example:

```
DB_NAME=url-shortener
MONGODB_URI=mongodb://localhost:27017/url-shortener

API_KEY=1234567890
HOST=http://localhost:3000

USERNAME=admin
PASSWORD=admin

TOKEN_SECRET=1234567890
```

Run the development server:

```bash
yarn && yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
