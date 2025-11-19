import mongoose from "mongoose";
// Node js automatically looks for a .env file in the root directory, so we don't need to import it
export async function connect(url?: string) {
    try {
        const dbUrl = url || process.env.MONGO_URL!; //The exclamation mark is to tell TypeScript that we are sure that this value is not null or undefined
        await mongoose.connect(dbUrl);
        
        const connection = mongoose.connection;
        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        })

        connection.on('error', (err) => {
            process.exit();
        })
        } catch (error) {
            console.log('Something goes wrong!');
            console.log(error);
        }
    }
