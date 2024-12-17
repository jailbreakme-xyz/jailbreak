import { exec } from "child_process";
import { promisify } from "util";
import initializeTournament from "../scripts/initializeTournamentProgram.js"; // Adjust the import path as necessary
import startTournament from "../scripts/startTournament.js"; // Adjust the import path as necessary

const execPromise = promisify(exec);

(async () => {
  try {
    // Step 1: Build the Anchor program
    console.log("Building the Anchor program...");
    await execPromise("anchor build");
    console.log("Build successful!");

    // Step 2: Deploy the Anchor program to Devnet
    console.log("Deploying the Anchor program to Devnet...");
    await execPromise("anchor deploy --provider.cluster devnet");
    console.log("Deployment successful!");

    // Step 3: Initialize the tournament
    console.log("Initializing the tournament...");
    await initializeTournament(true); // Ensure this function is defined in your initializeTournamentProgram.js
    console.log("Tournament initialized successfully!");

    // Step 4: Start the tournament
    console.log("Starting the tournament...");
    await startTournament(true); // Ensure this function is defined in your startTournament.js
    console.log("Tournament started successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
