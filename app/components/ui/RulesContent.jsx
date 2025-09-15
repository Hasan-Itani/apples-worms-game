// app/components/RulesContent.jsx
"use client";

import BlueDivider from "./BlueDivider";

const H = ({ children }) => (
  <div className="mt-3 mb-1 font-extrabold text-sky-300 text-center">
    {children}
  </div>
);
const P = ({ children }) => (
  <p className="text-sm leading-relaxed text-center">{children}</p>
);
const L = ({ children }) => (
  <li className="text-sm leading-relaxed">{children}</li>
);
const M = ({ children }) => (
  <div className="text-xs opacity-80 text-center">{children}</div>
);

export default function RulesContent() {
  return (
    <div className="w-full max-w-[720px] mx-auto text-white">
      <H>Apples & Worms™</H>
      <P>
        The objective of the game is to reveal winning symbols by flipping the
        tiles.
      </P>
      <BlueDivider />

      <H>To play the game:</H>
      <ul className="list-disc list-inside space-y-1 text-left">
        <L>Press ► on the entry screen to enter the main game.</L>
        <L>
          You can also tick DON’T SHOW NEXT TIME to skip the entry screen the
          next time you play.
        </L>
        <L>Choose your bet by pressing - and + below BET AMOUNT.</L>
        <L>Choose 1 of 3 sizes of the field: 3x3, 4x4, or 5x5 tiles.</L>
        <L>Choose the number of worms to be placed on the field:</L>
        <ul className="list-disc list-inside ml-6">
          <L>for field 3x3 - 1 to 8 worms;</L>
          <L>for field 4x4 - 2 to 15 worms;</L>
          <L>for field 5x5 - 2 to 24 worms.</L>
        </ul>
        <L>Choose Manual or Auto mode.</L>
        <L>Press the Start Game button to start the round.</L>
      </ul>
      <BlueDivider />

      <H>Manual Game Flow:</H>
      <ul className="list-disc list-inside space-y-1 text-left">
        <L>Click any tile to reveal a symbol under it.</L>
        <L>There are 2 symbols in the game:</L>
        <ul className="list-disc list-inside ml-6">
          <L>Apple symbol - increases the win;</L>
          <L>
            Worm symbol - ends the game round and destroys unsaved winnings.
          </L>
        </ul>
        <L>
          Winning values for each winning turn are shown in the blue cells in
          the row above the playing field.
        </L>
        <L>The cell with the current win is the highlighted one.</L>
        <L>On any winning turn, you can:</L>
        <ul className="list-disc list-inside ml-6">
          <L>
            Collect the current win and end the round by pressing the Collect
            button;
          </L>
          <L>Use the Bank It option to save part of the win;</L>
          <L>Continue the round by clicking new tiles.</L>
        </ul>
        <L>Revealing the worm ends the game round.</L>
        <L>
          After the end of the game round, all unselected tiles will reveal
          their symbols.
        </L>
      </ul>
      <BlueDivider />

      <H>Bank It Option:</H>
      <ul className="list-disc list-inside space-y-1 text-left">
        <L>The Bank It option is only available in the Manual game mode.</L>
        <L>
          Bank It allows you to save part of the win when the Worm symbol is
          revealed.
        </L>
        <L>
          On a winning turn, choose what amount of the bet you want to save
          using the − and + buttons in the Bank It field.
        </L>
        <L>
          Press the Bank It button to review the change to the winning values
          above the play area: they will be divided between the unsaved win
          (blue cells) and saved win (green cells).
        </L>
        <L>
          Press the Cancel button to cancel the option or to change the Bank
          amount.
        </L>
        <L>
          Press the Confirm button to confirm your choice and proceed with the
          round.
        </L>
        <L>
          The Bank It option can be used on every winning turn using different
          Bank amounts. Accumulated Bank amount will be shown in the current
          green cell.
        </L>
        <L>
          Please note: When using the Bank It option, the current winning value
          in the blue cell can't be lower than a minimal bet.
        </L>
        <L>
          Please note: Only the unsaved win amount shown in the blue cell will
          increase when tiles are uncovered.
        </L>
        <L>
          The accumulated Bank amount will be paid at the end of the round
          regardless of a Worm symbol being revealed.
        </L>
      </ul>
      <BlueDivider />

      <H>Autoplay:</H>
      <ul className="list-disc list-inside space-y-1 text-left">
        <L>Press the Auto button to switch to the Autoplay menu.</L>
        <L>
          You can set the Bet Amount, number of Worms, and the size of the field
          as in the regular gameplay.
        </L>
        <L>
          Click the Rounds field to open the drop-down list and choose the
          number of games to be played automatically.
        </L>
        <L>
          Click the tiles on the game field one by one to set the order in which
          tiles will reveal their symbols during the Autoplay session.
        </L>
        <L>
          Click Undo to cancel the chosen tiles in the reverse order or click
          the last tile in the order to cancel it.
        </L>
        <L>
          Please note: the number of the tiles chosen for the autoplay can't
          exceed the maximum number of tiles for the field minus the number of
          worms.
        </L>
        <L>
          You can also choose Stop at Any Loss and/or Stop at Any Win option.
        </L>
        <L>
          You can set automatic changes to the bet, using the − and + buttons
          next to the After a Win Increase By and After a Loss Increase By
          fields.
        </L>
        <L>
          Please note: The bet won't increase after the maximum bet limit is
          reached.
        </L>
        <L>
          Pressing START AUTOPLAY starts the autoplay session with your
          settings.
        </L>
        <L>During autoplay, the number of remaining rounds is displayed.</L>
        <L>Autoplay ends when:</L>
        <ul className="list-disc list-inside ml-6">
          <L>The game has run the number of times specified.</L>
          <L>You do not have sufficient funds for the next round.</L>
          <L>You can end autoplay by pressing STOP GAME.</L>
        </ul>
        <L>
          After the end of the game round, all unselected tiles will reveal
          their symbols.
        </L>
      </ul>
      <BlueDivider />

      <H>Game Details:</H>
      <ul className="list-disc list-inside space-y-1 text-left">
        <L>Game Details section shows the current game stats.</L>
        <L>
          Maximum Win field shows the maximum possible win for the game with the
          current settings.
        </L>
      </ul>
      <BlueDivider />

      <H>Maximum win limit:</H>
      <P>
        The maximum win in the game has an upper limit. For more information,
        see the Terms and Conditions.
      </P>
      <BlueDivider />

      <H>Return to Player:</H>
      <P>
        The minimum theoretical percentage return to player (RTP) is 87.50% and
        the maximum theoretical percentage return to player (RTP) is 97.20%. The
        RTP value is the theoretical return to player, calculated by dividing
        the total winnings by total amount bet from 1000000000 simulated game
        rounds.
      </P>
      <BlueDivider />

      <H>Note on disconnections:</H>
      <P>
        If you are disconnected from the Internet in the middle of the game, log
        in again into the casino. You will be automatically directed back to the
        game, and you can continue the game from the point where it was broken.
        If you re-open the game without re-logging into the casino, the game
        will start from the very beginning. In both cases, your previous wins
        will be paid.
      </P>
      <M>Malfunction voids all pays and plays.</M>
    </div>
  );
}
