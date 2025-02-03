const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Shopify Order Route
app.post("/api/orders", async (req, res) => {
    const { customer_name, email, phone, address, city, product_name, product_price } = req.body;

    console.log("Received Shopify Order:", req.body);

    const orderData = {
        order: {
            line_items: [
                {
                    title: product_name,
                    price: product_price,
                    quantity: 1
                }
            ],
            customer: {
                first_name: customer_name.split(" ")[0] || "Unknown",
                last_name: customer_name.split(" ")[1] || "",
                email: email,
                phone: phone,
                addresses: [
                    {
                        address1: address,
                        city: city,
                        country: "Morocco" // Default to Morocco
                    }
                ]
            },
            financial_status: "pending",
            send_receipt: true,
            send_fulfillment_receipt: true
        }
    };

    try {
        const response = await axios.post(
            `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2023-01/orders.json`,
            orderData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
                },
            }
        );

        console.log("Shopify Response:", response.data);
        res.json({ message: "Order submitted successfully!", order: response.data });

    } catch (error) {
        console.error("Error sending order to Shopify:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to send order to Shopify", details: error.response?.data });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
