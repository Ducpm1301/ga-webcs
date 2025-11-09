# task 1: Refine Default Layout:
## Task 1.1:
- There's a avatar in line 26 of src/components/layouts/Navbar.tsx. When press on it, I want to have a small dropdown menu to show user information and logout option.

# Task 2: Basis Statistic layout:
- I have a statistic page in src/pages/Statistic.tsx.
- After the user login, it'll have a list of partners being saved in the local storage , which named partners. Create a list of partners based on that list and put it in the header of the Statistic page as a select option dropdown menu. Each items in the drop down will have label as partner name and value as partner name.
- When user select a partner from the dropdown menu, the page will show the statistic of that partner. The statistic main content will have:
    - Input fields for start date and end date.
    - A button to submit the form and show the statistic of that partner. Before the statistic being shown, it'll call the API to get the statistic data.