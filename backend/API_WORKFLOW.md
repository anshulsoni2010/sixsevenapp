# API Development Workflow

## 🚀 **When Adding/Modifying API Endpoints:**

### 1. **Add JSDoc Swagger Comments**
```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   method:
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []
 *     // ... complete swagger spec
 */
```

### 2. **Check Documentation Status**
```bash
npm run check-swagger  # Verifies docs are up to date
```

### 3. **Regenerate Documentation**
```bash
npm run generate-swagger
```

### 3. **Test in Swagger UI**
- Visit: `http://localhost:3000/api/docs`
- Test the new/updated endpoint
- Verify request/response schemas

### 4. **Update API_README.md** (if needed)
- Add any special notes or usage examples
- Update endpoint lists if adding new routes

## 📝 **Quick Reference:**

**Common Swagger Patterns:**
- `security: [{ bearerAuth: [] }]` - Requires JWT auth
- `security: []` - No authentication (webhooks)
- Use proper HTTP status codes in responses
- Include all required parameters and their types

**Scripts:**
- `npm run generate-swagger` - Update docs
- `npm run check-swagger` - Verify docs are current
- `npm run dev:docs` - Generate + start server
- `npm run dev` - Start server only

## ✅ **Checklist for New Endpoints:**
- [ ] JSDoc swagger comments added
- [ ] Request/response schemas defined
- [ ] Authentication requirements specified
- [ ] Error responses documented
- [ ] `npm run check-swagger` executed (verify no outdated files)
- [ ] `npm run generate-swagger` executed
- [ ] Tested in Swagger UI
- [ ] API_README.md updated (if needed)

**Remember:** Keep swagger docs in sync with code changes! 🔄