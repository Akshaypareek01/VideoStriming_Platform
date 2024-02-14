import mongoose from 'mongoose'

const user ="developer"
const pass="djYVaymWsGoQ48k0"
const url=`mongodb+srv://${user}:${pass}@cluster0.x5k2qbq.mongodb.net/?retryWrites=true&w=majority`;
const connection = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

export default connection
