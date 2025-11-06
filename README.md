# PDF Generation Microservice

A standalone Node.js microservice for generating professional PDFs, designed to be integrated with .NET applications.

## Features

- Modern Node.js with ES Modules
- Express API endpoints
- PDF generation using PDFMake
- Support for multiple document types (Invoice, Receipt, etc.)
- Professional A4 layout with headers and footers
- Dynamic data population from JSON
- Base64 and buffer output options
- Error handling and logging

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```
PORT=3000
NODE_ENV=development
```

4. Replace the logo placeholder in `src/pdfService.js` with your company logo.

## Usage

### Starting the Service

```bash
npm start
```

The service will start on http://localhost:3000 (or your configured PORT).

### API Endpoints

1. **Health Check**
   ```
   GET /health
   ```

2. **Generate PDF**
   ```
   POST /generate-pdf
   Content-Type: application/json

   {
     "templateName": "invoice",
     "data": {
       // Your document data here
     }
   }
   ```

### Integration with .NET

#### C# Example
```csharp
using System.Net.Http;
using System.Text.Json;

public class PdfServiceClient
{
    private readonly HttpClient _client;
    private const string BaseUrl = "http://localhost:3000";

    public PdfServiceClient()
    {
        _client = new HttpClient { BaseAddress = new Uri(BaseUrl) };
    }

    public async Task<byte[]> GeneratePdfAsync(string templateName, object data)
    {
        var request = new
        {
            templateName,
            data
        };

        var response = await _client.PostAsJsonAsync("/generate-pdf", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<PdfResponse>();
        return Convert.FromBase64String(result.base64);
    }
}

public class PdfResponse
{
    public bool success { get; set; }
    public string filePath { get; set; }
    public string base64 { get; set; }
}
```

### Adding New Templates

1. Create a new template file in the `/templates` folder
2. Export a function that returns a PDFMake document definition
3. Add sample data to `/data/sampleData.json`

## Uninstalling/Removing the Module

To remove this module from your .NET solution:

1. Stop the Node.js service
2. Remove any integration code from your .NET application
3. Delete the module folder

## Error Handling

The service uses Winston for logging:
- Errors are logged to `error.log`
- All operations are logged to `combined.log`
- Console logging is enabled in development mode

## File Structure

```
pdf-maker-service/
├── src/
│   └── pdfService.js
├── templates/
│   └── invoice.js
├── data/
│   └── sampleData.json
├── output/
├── server.js
├── package.json
└── README.md
```

## Development

To add new templates or modify existing ones:

1. Create a new template file in `/templates`
2. Follow the PDFMake documentation for document definition
3. Test with sample data
4. Update the API documentation if needed

## Dependencies

- express: Web server framework
- pdfmake: PDF generation library
- winston: Logging
- cors: Cross-origin resource sharing
- dotenv: Environment configuration