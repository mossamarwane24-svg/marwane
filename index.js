import { createInterface } from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const messages = {
  1: "Hello World !",
  2: "Merci de vous être abonné !",
  3: "Merci d'avoir aimé et commenté !",
};

function showMenu() {
  console.log("\n=== Menu ===");
  console.log("1. Hello World");
  console.log("2. Abonnez-vous");
  console.log("3. Likez ou commentez");
  console.log("4. Afficher les trois messages");
  console.log("0. Quitter");
}

function messageFor(choice) {
  if (choice === "4") {
    return Object.values(messages).join("\n");
  }

  return messages[choice] ?? null;
}

async function main() {
  const rl = createInterface({ input, output, terminal: true });

  console.log("Bienvenue dans la démo du menu !");

  try {
    for await (const line of rl) {
      const choice = line.trim();

      if (choice === "0") {
        console.log("À bientôt !");
        break;
      }

      const message = messageFor(choice);
      if (message) {
        console.log(`\n${message}`);
      } else {
        console.log("\nChoix invalide. Sélectionnez une option de 0 à 4.");
      }

      showMenu();
      output.write("Votre choix : ");
    }
  } finally {
    rl.close();
  }
}

showMenu();
output.write("Votre choix : ");

main().catch((error) => {
  console.error("Une erreur est survenue :", error);
  process.exitCode = 1;
});

export { messageFor };
