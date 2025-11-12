# task 1: Refine Default Layout:
## Task 1.1:
- There's a avatar in line 26 of src/components/layouts/Navbar.tsx. When press on it, I want to have a small dropdown menu to show user information and logout option.

# Task 2: Basis Statistic layout:
- I have a statistic page in src/pages/Statistic.tsx.
- When user login, the API will response as API 1.1 in docx/api.md. The partners then being saved in local storage. Further detail can be seen in src/components/auth/AuthProvider.tsx:47.
- After the login finished, there'll be a popup to ask user to select a partner to be seen. The selected partner will be saved in local storage (Further info in AuthProvider, login function). In the main layout, the selected partner will be shown in the navbar, in a select dropdown, which can be used to switch between partners.
- The partner code will then be used in the API request. Further detail about the API request can be seen in docx/api.md and src/services/apiRoutes.ts (Last 3 routes).
- After the partner is selected, in the Statistic page, the user can see the summary of the selected partner. The summary will be shown in 3 tables: PXTK, PXLG, PXLT.
