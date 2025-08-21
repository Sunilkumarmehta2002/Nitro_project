# 📂 Node.js File Parser CRUD API

A RESTful API built with **Node.js** and **Express** that enables uploading, parsing, and managing files. It supports **background processing**, **progress tracking**, and **persistent storage** via SQLite and Sequelize.

---

## ✨ Features

* 📤 **File Upload**: Accepts files via `multipart/form-data` (`file` field).
* ⚙️ **Asynchronous Parsing**: Keeps API responsive with background workers.
* 📊 **Progress Tracking**: Query real-time status and progress.
* 🗄️ **CRUD Operations**:

  * **Create** → Upload new files
  * **Read** → Retrieve parsed data / list all files
  * **Delete** → Remove files & database records
* 💾 **Persistent Storage**: File metadata, progress, and parsed content stored in SQLite.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express
* **Database**: Sequelize + SQLite
* **File Handling**: Multer
* **Parsing**: `csv-parser`, `pdf-parse`

---

## 📂 Project Structure

```text
NItro project/
├── server.js                  # Entry point
├── database.sqlite            # SQLite DB (auto-created)
├── uploads/                   # Uploaded files
├── src/
│   ├── config/database.js      # Sequelize config
│   ├── controllers/fileController.js
│   ├── middleware/upload.js    # Multer setup
│   ├── models/File.js          # Sequelize model
│   ├── routes/fileRoutes.js    # Routes
│   └── services/fileProcessor.js # Background parsing
├── package.json
└── README.md
```

---

## 🚀 Setup & Installation

### 1️⃣ Prerequisites

* Node.js `v16+`
* npm (comes with Node)

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run the Application

```bash
# Development (auto-restart)
npx nodemon server.js

# Production
node server.js
```

➡️ By default, runs at: **[http://localhost:3000](http://localhost:3000)**
Override with:

```bash
PORT=4000 node server.js
```

---

## 📑 Supported File Types

* ✅ CSV (`text/csv`)
* ✅ PDF (`application/pdf`)
* ⚠️ Images (`image/jpeg`, `image/png`) can be uploaded but parsing will fail unless extended.

---

## 📡 API Endpoints

**Base URL**: `http://localhost:3000/files`

### 1) 📤 Upload a File

**POST** `/files`
`multipart/form-data` with field: `file`

```bash
curl -X POST http://localhost:3000/files \
  -F "file=@/path/to/your/file.csv"
```

📌 **Response (202 Accepted)**:

```json
{
  "id": "<uuid>",
  "filename": "file.csv",
  "status": "uploading",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 2) ⏳ Get File Progress

**GET** `/files/{file_id}/progress`

```bash
curl http://localhost:3000/files/<file_id>/progress
```

```json
{
  "file_id": "<uuid>",
  "status": "processing",
  "progress": 50
}
```

---

### 3) 📖 Get Parsed File Content

**GET** `/files/{file_id}`

```bash
curl http://localhost:3000/files/<file_id>
```

✅ **If ready**:

```json
{
  "id": "<uuid>",
  "filename": "file.csv",
  "content": { "type": "csv_data", "data": [/* rows */] }
}
```

✅ **PDF Example**:

```json
{
  "id": "<uuid>",
  "filename": "doc.pdf",
  "content": {
    "type": "pdf_data",
    "info": { /* metadata */ },
    "text": "First 2000 characters of extracted text..."
  }
}
```

⚠️ If still processing:

```json
{ "message": "File processing is not complete. Status: processing" }
```

❌ If failed:

```json
{ "message": "File processing failed." }
```

---

### 4) 📋 List All Files

**GET** `/files`

```json
[
  {
    "id": "59b2cc12-427c-4b13-ac89-23513914fdce",
    "filename": "terafac.pdf",
    "status": "ready",
    "createdAt": "2025-08-20T18:52:21.830Z"
  }
]
```

---

### 5) 🗑️ Delete a File

**DELETE** `/files/{file_id}`

```bash
curl -X DELETE http://localhost:3000/files/<file_id>
```

```json
{ "message": "File deleted successfully." }
```

---

## ⚙️ How It Works

1. File uploaded → stored in `uploads/` with UUID prefix.
2. DB record created with `status: uploading`.
3. Background service parses file → updates status & progress.
4. On success → `status: ready`, parsed content stored.
5. On error → `status: failed`, error saved in DB.

---

## 🐛 Troubleshooting

* ❌ Upload fails → Ensure field name is `file`.
* ❌ File rejected → Check MIME types in `src/middleware/upload.js`.
* ❌ No DB → Ensure `database.sqlite` exists (auto-created).
* Reset → Delete `database.sqlite` (will reinitialize).

---

## 🚀 Future Enhancements

* 🔔 **WebSocket/SSE** for real-time progress updates.
* 📌 **Job Queue** (BullMQ/Redis) for reliable background processing.
* 🔐 **Authentication** with JWTs.
* ☁️ **Cloud Storage** (S3, GCS).
* 🧪 **Testing** with Jest + Supertest.

---

## 📜 License

[ISC](./LICENSE)
