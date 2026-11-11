# CAR PARKING MANAGEMENT SYSTEM

A comprehensive full-stack Web Application for managing car parking operations, encompassing operational tracking (OLTP), data warehousing (OLAP), and machine learning insights (Data Mining).

## Project Overview
This project simulates a production-ready Car Parking Management system for a college demonstration. It features a complete pipeline from real-time transaction recording to analytical dashboards and machine learning predictions.

The system is built on a 3-tier architecture:
1. **OLTP (Online Transaction Processing)**: Handles day-to-day operations like vehicle entry, exit, payments, and slot assignment. Database: `parking__system`.
2. **OLAP (Online Analytical Processing)**: A Data Warehouse layer designed for complex querying and analytical reporting (Roll-up, Drill-down, Slice, Dice, Pivot). Database: `parking_warehouse`.
3. **Data Mining & Machine Learning**: Python-based analysis extracting insights (K-Means clustering, Linear Regression) based on warehouse data.

## Features
- **Dashboard**: High-level KPIs and real-time transaction tracking.
- **Vehicle Management**: Full CRUD operations for registering user vehicles.
- **Parking Slots**: Visual monitoring of parking slot statuses across different floors.
- **Parking Entry/Exit**: Operational tracking of vehicles entering and leaving, with automatic fee calculation based on duration.
- **Payments**: Processing and tracking of parking fees.
- **Parking History**: A comprehensive audit log of all parking transactions.
- **Analytics (OLAP)**: Visualizations of revenue, hourly activity, and various OLAP operations.
- **Data Mining**: Presentation of ML metrics, cluster analysis, and insights drawn from Python models.
- **Reports**: Printable and CSV-exportable parking reports.

## Architecture & Technology Stack
### Frontend
- React 19 / TypeScript
- Vite (Bundler)
- Tailwind CSS (Styling)
- Recharts (Data Visualization)
- Lucide React (Icons)
- React Router (Navigation)

### Backend
- Node.js / Express.js
- MySQL2 (Database Driver)
- RESTful APIs

### Databases
- MySQL 8.0
- **`parking__system`**: 3rd Normal Form schema for fast writes and consistency.
- **`parking_warehouse`**: Star Schema (Fact and Dimension tables) optimized for read-heavy analytics.

### Data Mining
- Python, Pandas, Scikit-Learn (Exploratory Data Analysis, Linear Regression, K-Means Clustering).

## Setup & Installation

### 1. Database Setup
Ensure you have MySQL installed and running.
1. The project expects two existing databases: `parking__system` and `parking_warehouse`.
2. Ensure they are imported and have the necessary schema and data (already completed in prior phases).

### 2. Environment Variables
In the root directory, create a `.env` file using the provided `.env.example` template:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_OLTP=parking__system
DB_WAREHOUSE=parking_warehouse
PORT=5000
```

### 3. Install Dependencies
**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 4. Running the Application
Open two terminal windows/tabs:

**Terminal 1 (Backend):**
```bash
cd server
npm run start # or node server.js
```
*Runs on http://localhost:5000*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*Runs on http://localhost:5173*

## OLAP Operations Demonstrated
The Analytics dashboard demonstrates key OLAP concepts:
- **Roll-up**: Aggregating revenue from individual transactions up to Vehicle Type.
- **Drill-down**: Breaking down Vehicle Type revenue further by User Type (Student, Faculty, etc.).
- **Slice**: Filtering the warehouse data to look exclusively at "Car" parking records.
- **Dice**: Filtering across multiple dimensions simultaneously (e.g., Car + Visitor + Duration > 60).
- **Pivot**: Cross-tabulating User Type against Vehicle Type counts.

## Data Mining Techniques
Data mining was executed via Python scripts (`data-mining/parking_data_mining.py`), generating a results dataset (`parking_data_mining_results.csv`). The web app consumes this output for visualization:
- **K-Means Clustering**: Unsupervised learning grouping parking behaviors into 3 clusters based on Duration and Fee.
- **Linear Regression**: An exploratory model attempting to predict Parking Fee based on various features. *(Note: As indicated by the R² score, this model demonstrates limited explanatory power on the current dataset, serving primarily as an exploratory exercise).*
- **Statistical Analysis**: Correlation matrices and distributional insights.

## Future Improvements
- Implement JWT-based Authentication and Authorization (Admin vs User roles).
- Move Python Data Mining to an active microservice (e.g., Flask/FastAPI) instead of a static CSV output for real-time predictions.
- Integrate a real payment gateway (Stripe/PayPal) for the Payment module.
- Add real-time WebSocket updates for parking slot statuses.
