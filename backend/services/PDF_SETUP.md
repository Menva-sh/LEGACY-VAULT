# PDF Generation Setup

## Overview
Legacy Vault uses ReportLab (Python library) to generate professional 2-page Digital Will and Testament PDFs.

## Installation

### 1. Install Python Dependencies

```bash
# Using pip
pip install reportlab

# Or on Linux/Mac
pip3 install reportlab
```

### 2. Verify Installation

```bash
# Test that ReportLab is installed
python3 -c "from reportlab.pdfgen import canvas; print('✓ ReportLab installed')"
```

### 3. Node.js Configuration

The backend Node.js server automatically:
- Spawns the Python process: `python3 backend/services/willPdfGenerator.py`
- Sends user data as JSON via stdin
- Receives PDF bytes via stdout
- Returns PDF as binary response

## API Endpoint

### Generate Professional PDF

**Endpoint:** `POST /api/wills/generate-professional`

**Authentication:** Required (JWT Bearer token)

**Request:**
```bash
curl -X POST https://api.legacyvault.com/api/wills/generate-professional \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
- Status: 200 OK
- Content-Type: application/pdf
- Body: Binary PDF file

**Example with JavaScript:**
```javascript
async function generateWill() {
  const response = await fetch('/api/wills/generate-professional', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Digital_Will_${userId}.pdf`;
    a.click();
  }
}
```

## PDF Specifications

### Document Structure
- **Page 1:** Main will document with header, preamble, articles I-IV
- **Page 2:** Signature and execution page with notarial seal

### Styling
- **Font:** Helvetica / Helvetica-Bold
- **Colors:** Custom brand palette (MAUVE, BLUSH, CREAM, etc.)
- **Layout:** A4 (210mm × 297mm)
- **Margins:** 20mm left/right, 11mm footer band

### Content Sections
1. **Header Band** - Wordmark, title, document meta
2. **Preamble Box** - Legal declaration
3. **Article I** - Grantor identification
4. **Article II** - Schedule of digital assets (up to 3)
5. **Article III** - Appointment of executors (up to 2)
6. **Article IV** - Governing terms and disclaimer
7. **Page 2** - Signature blocks, witness attestation, notarial seal

## Troubleshooting

### Python Not Found
```
Error: Failed to spawn Python: spawn python3 ENOENT
```
**Solution:** Install Python 3 on your system
- Windows: Download from python.org
- Linux: `sudo apt-get install python3`
- macOS: `brew install python3`

### ReportLab Not Found
```
Error: ModuleNotFoundError: No module named 'reportlab'
```
**Solution:** Install ReportLab
```bash
pip3 install reportlab
```

### PDF Generation Fails
Enable debug logging in willPdfController.js:
```javascript
console.log(`Python stderr: ${errorOutput}`);
```

Check Node.js has permission to spawn Python subprocess.

## Performance Notes

- PDF generation: ~500-1000ms per document
- File size: ~80-120KB per PDF
- Memory usage: Low (PDF generated in-memory, streamed to client)

## Security Considerations

- PDFs contain sensitive information (asset details, executor info)
- Always verify user authentication before generating
- Use HTTPS for PDF downloads
- Consider expiring generated PDFs after a time period
- Store PDFs securely with access controls

## Future Enhancements

- [ ] Support more than 3 assets with pagination
- [ ] Support more than 2 executors with pagination
- [ ] Custom branding (logo, colors)
- [ ] Multi-language support
- [ ] Archival PDF/A format for long-term storage
- [ ] Digital signatures (e-signature)
