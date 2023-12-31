const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvw2zcx.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const allData = client.db("allToysZone").collection("toysData");
    const toyCollection = client.db("toys").collection("allToy");

    app.get("/toysData", async (req, res) => {
      const cursor = allData.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // body.createdAt = new Date();

    app.post("/addToy", async (req, res) => {
      const body = req.body;
      // body.createdAt = new price();
      const result = await toyCollection.insertOne(body);
      // console.log(result);
      res.send(result);
    });
    app.get("/allToys", async (req, res) => {
      const result = await toyCollection
        .find({})
        .limit(20)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    const indexKeys = { name: 1 };
    const indexOptions = { name: "searchName" };

    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/nameSearch/:text", async (req, res) => {
      const searchName = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            {
              name: { $regex: searchName, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.get("/toys/:email", async (req, res) => {
      // console.log(req.params.name);
      const result = await toyCollection
        .find({ postedBy: req.params.email })
        .toArray();
      res.send(result);
    });
    app.delete("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = {
        $or: {
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };

      const result = await toyCollection.updateOne(filter, update);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy server running");
});
app.listen(port, () => {
  console.log(`server on port:${port}`);
});
