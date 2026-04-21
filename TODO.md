# High Priority
- [x] Offer flow:
    - [x] When buyer submits offer, create pending offer and notify seller
    - [x] Seller can accept or decline offer; if accepted, allow seller and buyer to chat (later create escrow transaction) and notify buyer
    - [x] Buyer can withdraw offer if it's still pending
    - [x] Buyer should be able to choose how many tickets in their offer (currently hardcoded to 1)
    - [x] Seller can choose how many tickets can be sold (for example don't leave me with 1 ticket if I have 4 to sell)
    - [x] Don't allow buyer to submit multiple offers on the same listing unless they withdraw the previous one
    - [x] Once offer is accepted, deduct the sold quantity from the listing and update status to pending if there are still tickets available, or sold if all tickets are sold, and remove it from the browse page
    - [ ] Add option for seller to make a counteroffer to the buyer's offer
- [x] Use 21st.dev to redesign the browse page and listing detail page
- [x] Browse tickets button is bigger than sell tickets button on home page, should be equal size
- [x] Redesign UI
- [x] Show offers submitted and received
- [x] Remove all API keys from code, and use environment variables instead. Add instructions in README for setting up .env file.
- [x] Add more tests for critical flows (creating listing, making offer, accepting offer, etc.)
- [x] Add loading states for all async actions (fetching listings, submitting offers, etc.)
- [x] Add error handling and display error messages to users when API calls fail
- [x] Move test files to a __tests__ directory for better organization

# Medium Priority
- [ ] Add pagination or infinite scroll to browse page
- [ ] Setup Oauth with Google and Facebook for easier authentication