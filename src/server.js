import app from './app';

app.listen(process.env.PORT || 3333, () => {
  console.log(`Server listening at port http://localhost:3333`);
});
