# 🧩 PDF Generator API — Postman Request Details

Use this setup in **Postman** to test the PDF Generation API.


## 🔹 Request Type
**POST**

## 🔹 URL
http://localhost:3000/api/generate





## 🔹 Headers

| Content-Type | application/json |
| organizationId | 7f3c9a7b-2f1d-4d63-bb7a-92c5f708f21c |
| reportId | e1b41d2a-5f99-4a5c-9a74-3c0f89a2f9d0 |



## 🔹 Body (raw JSON)
In Postman, select **Body → raw → JSON** and paste:

{
  "data": {
    "companyInfo": {
      "name": "Test Company"
    },
    "customer": {
      "name": "Jane Doe"
    },
    "date": "2025-11-11",
    "page": 1
  }
}