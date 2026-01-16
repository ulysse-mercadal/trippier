# 🤝 Contributing to Trippier

First of all, thank you for contributing to Trippier! This document outlines the standards and procedures we use to keep the codebase clean and robust.

---

## 🎨 Coding Standards & Formatting

We enforce strict coding standards. Our project is configured to **automatically format and clean code on save**.

### 1. Automatic Formatting (VS Code)

Ensure you are using **VS Code** and have opened the **root folder** of the project.
The settings in `.vscode/settings.json` will automatically trigger:

- **ESLint Fixes**: Corrects logical errors and enforces rules.
- **Prettier**: Standardizes indentation, quotes, and layout.
- **Header Injection**: Adds the mandatory project header to every file.
- **Cleanup**: Automatically removes redundant empty lines and ensures a newline at the end of the file.

### 2. The Project Header

Every file must start with the project header (automatically added on save). Depending on the module you are working on (Mobile, API, or Web App), the header will adjust accordingly.

Example:
```javascript
// **************************************************************************
//
//  Trippier Project - [Module Name]
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************
```

### 3. Personalizing Your Header
If you are a new contributor, you should update the ESLint configuration in each module to include your own name and email in the headers you generate.

1. Open `mobile/.eslintrc.js`, `backend/eslint.config.mjs`, and `frontend/eslint.config.mjs`.
2. Locate the `header/header` rule.
3. Update the strings with your information.
4. Save the files. All future files you save will now feature your personal header.

### 4. Linting Commands

If you need to manually check or fix files:

```bash
cd mobile
npm run lint          # Check for errors
npx eslint . --fix    # Auto-fix errors
```

---

## 🔑 Environment Variables

This project uses a unified environment variable system for API keys. 

- **GOOGLE_MAPS_API_KEY**: This key is used across the Backend (for Places API), the Frontend (for Maps JavaScript API), and the Mobile app (for Native Maps SDKs).

When adding new environment variables:
1.  Update `.env.example` at the root.
2.  If the variable is needed in the Frontend browser, update `frontend/next.config.ts`.
3.  If the variable is needed in the Mobile app, update `mobile/env.d.ts` and the respective native configurations (`AndroidManifest.xml` / `AppDelegate.mm`).

---

## 🛠 Development Workflow

### Feature Branches

1.  **Sync**: Always ensure your `main` branch is up to date.
2.  **Branch**: Create a descriptive branch: `git checkout -b feat/my-new-feature` or `git checkout -b fix/issue-name`.
3.  **Develop**: Make your changes, following the formatting rules.
4.  **Test**: Ensure the stack still launches with `make up`.

### Commit Messages

We follow a clear commit convention:

- `feat: ...` for new features.
- `fix: ...` for bug fixes.
- `docs: ...` for documentation changes.
- `style: ...` for formatting changes.

---

## 🧪 Testing

Before submitting a Pull Request, please verify:

1.  The Backend migrations run successfully.
2.  The Frontend builds without errors.
3.  The Mobile app connects correctly to the API (use `adb reverse` for testing).

---

_Thank you for helping us build the future of travel planning!_
