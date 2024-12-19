const { ethers } = require("ethers");
const { Telegraf } = require("telegraf");
require("dotenv").config();
const botToken=process.env.botToken;
const privateKey=process.env.privateKey;
const contractAddress=process.env.contractAddress;
const alchemyUrl=process.env.alchemyUrl;
const { abi } = require('./ignition/deployments/chain-11155111/artifacts/TelegramBot#UserContract.json');
const bot = new Telegraf(botToken);
const provider = new ethers.JsonRpcProvider(alchemyUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);
const userStates = {};
bot.start((ctx) => {
    const userId = ctx.from.id;
    userStates[userId] = { step: 0, data: {} };
    ctx.reply(
        "Welcome! Let's save your details on the blockchain.\n\n" +
        "Type /add to add your details or /view to view existing details."
    );
});
bot.command("add", (ctx) => {
    const userId = ctx.from.id;
    userStates[userId] = { step: 0, data: {} };
    ctx.reply("Please enter your *name*:", { parse_mode: "Markdown" });
});
bot.command("view", async (ctx) => {
    const userAddress = wallet.address;
    ctx.reply("Fetching your details from the blockchain. Please wait...");
    try {
        const [name, age, gender, storedAddress] = await contract.getUser(userAddress);
        if (!name) {
            ctx.reply("No details found for your address.");
        } else {
            ctx.reply(
                `Here are your details from the blockchain:\n\n` +
                `*Name:* ${name}\n` +
                `*Age:* ${age}\n` +
                `*Gender:* ${gender}\n` +
                `*Address:* ${storedAddress}`,
                { parse_mode: "Markdown" }
            );
        }
    } catch (error) {
        console.error(error);
        ctx.reply("An error occurred while fetching your details. Please try again later.");
    }
});
bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    if (!userStates[userId]) {
        ctx.reply("Please start the process by typing /add or /view.");
        return;
    }
    const userState = userStates[userId];
    const userInput = ctx.message.text.trim();
    try {
        switch (userState.step) {
            case 0: // Collect Name
                userState.data.name = userInput;
                userState.step++;
                ctx.reply("Got it! Now, please enter your *age*:", { parse_mode: "Markdown" });
                break;

            case 1: // Collect Age
                const userAge = parseInt(userInput, 10);
                if (isNaN(userAge) || userAge <= 0 || userAge > 120) {
                    ctx.reply("Invalid age. Please enter a valid number.");
                    return;
                }
                userState.data.age = userAge;
                userState.step++;
                ctx.reply("Great! Now, please enter your *gender* (e.g., Male, Female, Other):", { parse_mode: "Markdown" });
                break;

            case 2: // Collect Gender
                userState.data.gender = userInput;
                userState.step++;
                ctx.reply("Almost done! Please enter your *address* (e.g., 123 Main St):", { parse_mode: "Markdown" });
                break;

            case 3: // Collect Address and Save Data to Blockchain
                userState.data.address = userInput;

                // Prepare data for the blockchain
                const { name, age, gender, address } = userState.data;

                ctx.reply("Saving your details on the blockchain. Please wait...");

                // Save data to the Ethereum blockchain
                const tx = await contract.addUser(name, age, gender, address);
                await tx.wait();

                ctx.reply(
                    `Your details have been successfully saved on the blockchain!\n\n` +
                    `Here are your details:\n\n` +
                    `*Name:* ${name}\n` +
                    `*Age:* ${age}\n` +
                    `*Gender:* ${gender}\n` +
                    `*Address:* ${address}`,
                    { parse_mode: "Markdown" }
                );

                // Clear user state
                delete userStates[userId];
                break;

            default:
                ctx.reply("An unexpected error occurred. Please type /add to begin again.");
                delete userStates[userId];
        }
    } catch (error) {
        console.error(error);
        ctx.reply("An error occurred while processing your request. Please try again later.");
        delete userStates[userId];
    }
});

// Launch the bot
bot.launch().then(() => {
    console.log("Telegram bot is running...");
}).catch((error) => {
    console.error("Failed to launch the bot:", error);
});
