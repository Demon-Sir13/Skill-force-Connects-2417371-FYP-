# Dependency Cleanup Notes

## Dead Dependencies

### `stripe` (server)
- Package: `stripe@^20.4.1` in `server/package.json`
- Status: **UNUSED** — no files import or require it
- Action: `cd server && npm uninstall stripe`

### `@stripe/stripe-js` (client)
- Package: `@stripe/stripe-js@^8.10.0` in `client/package.json`
- Status: **UNUSED** — no client files import it
- Action: `cd client && npm uninstall @stripe/stripe-js`

## Legacy Files

### `server/src/controllers/esewa.controller.js`
- Status: **LEGACY** — superseded by `payment.controller.js`
- The primary payment logic lives in `payment.controller.js`
- Review before removing to ensure no routes still reference it

## Removal Commands

```bash
# From project root:
cd server && npm uninstall stripe
cd ../client && npm uninstall @stripe/stripe-js
```
