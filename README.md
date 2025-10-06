# GymLogger

This repository contains the frontend for GymLogger. Please read this [Dev article](https://dev.to/jjpark987/building-a-gym-logging-app-3c9c) for more details.

## Geting Started

### Prerequisites

- Node.js
- Expo go
- EAS CLI
- SQLite

### Installation

1. Clone the repository

```zsh
git clone git@github.com:jjpark987/gymlogger.git
```

2. Install eas-cli

```zsh
npm install -g eas-cli
```

3. Install dependencies

```zsh
npm install
```

4. Start the app

```zsh
npx expo start
```

Scan the QR code on an iPhone via Expo app to run.

## Update Published Version

1. Push an update to Expo's cloud

```zsh
eas update --branch main --message "Update message"
```
