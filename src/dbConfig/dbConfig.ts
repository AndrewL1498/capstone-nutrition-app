import mongoose from "mongoose";
// Node js automatically looks for a .env file in the root directory, so we don't need to import it
export async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URL!); //The exclamation mark is to tell TypeScript that we are sure that this value is not null or undefined
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error. Please make sure MongoDB is running.', err);
            process.exit();
        })
        } catch (error) {
            console.log('Something goes wrong!');
            console.log(error);
        }
    }
