# Train Tracker (SNCFT Banlieue Sud)

A full-stack application for tracking suburban trains in real-time, following a strict MVC architecture.

## 📁 Folder Structure

```
TrainTracker/
├── database.sql       # MySQL Database Schema
├── backend/           # Node.js + Express Backend
│   ├── config/
│   │   └── db.js      # MySQL Connection Config
│   ├── controllers/
│   │   └── trainController.js # Logic for fetching trains
│   ├── routes/
│   │   └── trainRoutes.js # Express routing
│   ├── services/
│   │   └── gpsService.js # Background job to fetch GPS data
│   ├── server.js      # Entry point
│   └── package.json
└── mobile/            # React Native Mobile Application
    ├── App.js         # Navigation Root
    ├── index.js       # App Entry
    ├── package.json   # Dependencies
    └── src/
        ├── screens/
        │   ├── HomeScreen.js # Landing Page
        │   └── MapScreen.js  # Real-time Map
        └── services/
            └── api.js        # Axios definitions
```

---

## 🛠 Installation Steps

### 1. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench).
2. Execute the `database.sql` script to create the `train_tracker` database and tables.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd TrainTracker/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update MySQL credentials in `config/db.js` if necessary (or use a `.env` file).
4. Start the server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The server will run on `http://localhost:3000` and immediately start fetching coordinates.*

### 3. Mobile Setup (React Native)
*Prerequisites:* You must have your React Native environment set up (Android Studio/Xcode).

1. Due to the way React Native scaffoldings work, you should initialize a project and copy the `src` folder, `App.js`, and merge `package.json` **OR** run npm install on the provided folder:
   ```bash
   cd TrainTracker/mobile
   npm install
   ```
2. If using iOS, install Pods:
   ```bash
   cd ios && pod install && cd ..
   ```
3. Start the Metro bundler:
   ```bash
   npm start
   ```
4. Run the app on your emulator or physical device:
   ```bash
   npm run android
   # or
   npm run ios
   ```
*Note:* If you run on a physical Android device, remember to update the `API_BASE_URL` in `mobile/src/services/api.js` to point to your computer's local network IP instead of `10.0.2.2`.

---

## 📡 API Documentation

### Get All Trains
Retrieves the latest position and details of all tracked trains.

- **URL:** `/api/trains`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "train_id": "T123",
        "latitude": 36.8065,
        "longitude": 10.1815,
        "speed": 45,
        "timestamp": "2023-11-20T14:30:00.000Z"
      },
      {
        "id": 2,
        "train_id": "T456",
        "latitude": 36.7551,
        "longitude": 10.2746,
        "speed": 60,
        "timestamp": "2023-11-20T14:30:00.000Z"
      }
    ]
    ```

### Internal GPS Service
The backend implements an internal service `services/gpsService.js` that pulls from `https://api.sncft.tn/gps/trains` every `10` seconds and updates the database, meaning the mobile app simply queries our high-speed SQL database instead of spamming and overwhelming the external SNCFT API.
