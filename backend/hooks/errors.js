const catchErrors = () => {
  process.on("uncaughtException", async function (err) {
    console.log(`Caught exception at ${new Date()}: ` + err);
  });
};

export { catchErrors as catchErrors };
