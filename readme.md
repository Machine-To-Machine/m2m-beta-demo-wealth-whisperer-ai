# WealthWhisperer AI

A Node.js backend service that provides AI-powered financial insights and chat capabilities using OpenAI's GPT-4 model with machine-to-machine (M2M) verification capabilities.

## Features

- 🤖 AI-powered chat interface
- 💹 Financial data analysis and insights
- 📊 Stock market data integration
- 🔐 Verifiable Credentials (VC) authentication
- 📝 Query logging system

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Yahoo Finance API access

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

## Environment Setup

This application uses environment variables for configuration. Copy `.env.example` to `.env` and configure it according to the instruction.

## Running the Application

```bash
# Development mode
npm run dev
```

The server will start on port 8003 (or your specified PORT in .env)

## API Endpoints

### Chat Endpoints
- `POST /chat` - General AI chat interface
- `POST /finance` - Financial advice and analysis (requires VC authentication)

### Stock Data
- `POST /stock` - Retrieve stock market data

### Log Management
- `GET /log` - Fetch chat history logs
- `DELETE /log` - Clear chat history logs

## Authentication

The application uses Verifiable Credentials (VC) for secure authentication. Include the VC JWT token in the request header for protected endpoints.
