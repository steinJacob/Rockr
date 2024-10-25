# Feature Documentation
---
<blockquote>

# React App Client
---
## Pages
<blockquote>


### Login.js
The Login Page. Displayed upon webpage startup.

Displays the webpage name, username input, password input, and a link to the 'Create Account' page.

Login Inputs:
User can input their personal username and password to gain access to the main site.
- Successful Login: Redirected to Home Page
- Unsuccessful Login: Remains on Login Page

### CreateAccount.js
The Create Account Page. Can be accessed via the Login page.

Displays input boxes for a user's first name, last name, username, password, email, and phone number, as well as a 'Submit' button and a link to the Login Page.

Create Account Inputs:
User can input their personal information and submit it.
- Successful Submission: The user's account is added and saved to the database, and the user can then log in on future webpage visits.
- Unsuccessful Submission: The user's account is not created.

### Home.js
The Home Page. Can be accessed via a successful login on the Login Page.

Displays a 'listing' for the user to 'swipe' "Yes!" or "No!" on, which contains an image of a chair.
Contains a side menu which is accessed via a 'Show Menu' button in the top-left of the page.
Contains a header which displays the name of the webpage.
</blockquote>

## Components
<blockquote>

### Header.js
Returns a header component. Creates a strip at the top of the page with a title and side-menu button.

MUST be used alongside SideMenu component 

Takes (isMenuVisible : useState) and (toggleMenu : method) props.
- Requires declaration of boolean useState variable for isMenuVisible prop.
- Requires declaration of method to change state of isMenuVisible prop.

### SideMenu.js
Returns a side menu component. Creates a toggleable menu on the left of the page with links to other pages.

MUST be used alongside Header component

Takes (isMenuVisible : useState), (menuLinks : String[]), and (menuNames : String[]) props.
- Requires declaration of boolean useState variable for isMenuVisile prop.
- Requires declaration of parallel lists (menuLinks and menuNames), where each link is the same index as the name of the link. Will create a button with the    menuNames text that redirects to corresponding menuLinks link

### Listing.js
Creates listings and has the ability to filter them by color, condition, and price.

Gives the user an ability to add a listing and declare all the information about it.

Has a "Listings" grid that shows the listings and gives the users an ability to edit or delete them.

Currently only pulls from locally stored images, in future it should pull from back-end server.

</blockquote>

</blockquote>
