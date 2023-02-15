import "cypress-localstorage-commands";

export class GameActions {
  static openHomePage() {
    // This metheod will open API CARD GAME
    cy.visit(`${Cypress.env("basic_URL")}`);
  }

  static setUpBaseDeck(withHowManyDecks) {
    // Making API request and saving it's body as response
    cy.request(`${Cypress.env("base_URL")}new/shuffle/?deck_count=${withHowManyDecks}`).then(
      (response) => {
        // Checking if API call is sucessful
        expect(response.body.success).to.be.true;
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("remaining", withHowManyDecks * 52);
        expect(response.headers).to.have.property("content-type", "application/json");

        // Getting API's reposonse body and accesing deck_id vale, extracting it as string and cleaning the string
        const deckIDJSON = response.body.deck_id;
        const deckIDString = JSON.stringify(deckIDJSON);
        const deckID = deckIDString.substring(1, deckIDString.length - 1);

        // Setting deck_id as global value via Cypress package
        cy.setLocalStorage("deckID", deckID);
      }
    );
  }

  static playOneTurn(howManyCards, pileName) {
    // This method will draw how many cards is specified and put them in a named pile

    // Accessing deckID from local storange and passing it into new API call to draw cards
    cy.getLocalStorage("deckID").then((deckID) => {
      // Making API call and saving it's response as an object, then validating properties
      cy.request(`${Cypress.env("base_URL")}${deckID}/draw/?count=${howManyCards}`)
        .then((response) => {
          expect(response.body.success).to.be.true;
          expect(response.status).to.eq(200);
          expect(response.headers).to.have.property("content-type", "application/json");

          // Saving Cards
          const firstCard = response.body.cards[0].code;
          const secondCard = response.body.cards[1].code;
          const thirdCard = response.body.cards[2].code;
          // cy.log(firstCard);
          // cy.log(secondCard);
          // cy.log(thirdCard);

          // Saving Cards in local storage
          const setOfCards = firstCard + "," + secondCard + "," + thirdCard;
          cy.setLocalStorage("myCards", setOfCards);
        })
        .then(() => {
          // Accessing my drawn cards saved as myCards from local storage
          cy.getLocalStorage("myCards").then((myCards) => {
            cy.log(myCards);
            // Making API call and pasing myCards as a value along with pileName to save my cards to the pile
            cy.request(
              `https://www.deckofcardsapi.com/api/deck/${deckID}/pile/` +
                pileName +
                `/add/?cards=${myCards}`
            ).then((response) => {
              // Validating response
              expect(response.body.success).to.be.true;
              expect(response.status).to.eq(200);
              expect(response.headers).to.have.property("content-type", "application/json");

              // cy.setLocalStorage("myPile", pileName)
            });
          });
        })
        .then(() => {
          // Making API call to see to see the cards listed
          cy.request(
            `https://www.deckofcardsapi.com/api/deck/${deckID}/pile/` + pileName + `/list/`
          ).then((response) => {
            // Testing API response
            expect(response.body.success).to.be.true;
            expect(response.status).to.eq(200);
            expect(response.headers).to.have.property("content-type", "application/json");

            // Extracting listed cards from pile and preparing them to compare
            const cardsInPIle = response.body.piles[pileName];
            const firstCardInPIleJSON = cardsInPIle.cards[0].code;
            const secondCardInPileJSON = cardsInPIle.cards[1].code;
            const thirdCardInPileJSON = cardsInPIle.cards[2].code;

            const firstCardInPIle = JSON.stringify(firstCardInPIleJSON);
            const secondCardInPile = JSON.stringify(secondCardInPileJSON);
            const thirdCardInPile = JSON.stringify(thirdCardInPileJSON);
            const cleaningFirstCard = firstCardInPIle.substring(1, firstCardInPIle.length - 1);
            const cleaningSecondCard = secondCardInPile.substring(1, secondCardInPile.length - 1);
            const cleaningThirdCard = thirdCardInPile.substring(1, thirdCardInPile.length - 1);

            const cardsInPileArray =
              cleaningFirstCard + "," + cleaningSecondCard + "," + cleaningThirdCard;

            // cy.log(firstCardInPIle);
            // cy.log(secondCardInPile);
            // cy.log(thirdCardInPile);

            // Comparing cards in piles to my cards
            cy.getLocalStorage("myCards").then((myCards) => {
              expect(myCards).to.be.deep.eq(cardsInPileArray);
            });
          });
        });
    });
  }
}
