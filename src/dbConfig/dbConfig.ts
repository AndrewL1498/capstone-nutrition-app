import mongoose from "mongoose";

export async function connect() {
  try {
    const dbUrl =
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_TEST_URL
        : process.env.MONGO_URL;

    if (!dbUrl) {
      throw new Error(
        `Missing database URL for environment: ${process.env.NODE_ENV}`
      );
    }

    // Avoid multiple connections during testing / hot reload
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(dbUrl);

    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected (${process.env.NODE_ENV})`);
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.log("Something goes wrong!");
    console.log(error);
  }
}
