import { GameActions } from "../pages/action";

describe("API card game", () => {
  const withHowManyDecks = 1;
  const howManyCards = 3;
  const firstPile = "first_pile";
  const secondPile = "second_pile";

  it("API card game", () => {
    GameActions.openHomePage();
    GameActions.setUpBaseDeck(withHowManyDecks);
    GameActions.playOneTurn(howManyCards, firstPile);
    GameActions.playOneTurn(howManyCards, secondPile);
  });
});
