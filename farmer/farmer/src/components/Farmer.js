import { useState } from "react";

import ipfs from "../ipfs";

const Farmer = (props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [editQuantity, setEditQuantity] = useState("")

  const formHandler = async (event) => {
    event.preventDefault();
    const { path } = await ipfs.add(image);
    if (path) {
      props.createProduct(name, description, path, quantity, price);
    }
  };

  const buyProduct = (_index, _quantity) => {
    if (buyQuantity) {
      props.buyProduct(_index, buyQuantity);
    }
  };

  const editQuantityHandler = (_index)=>{
    if(editQuantity !== ""){
      props.editQuantity(_index, editQuantity);
    }
  }

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    if (image === "" || image === undefined) {
      console.log("reached");
      return;
    }
    console.log(image);
    setImage(image);
  };
  return (
    <div style={{ padding: "36px" }}>
      <div className="row row-cols-2 row-cols-md-3 mb-3">
        {props.products.map((product) => (
          <div className="col">
            <div className="card mb-4 rounded-3 shadow-sm">
              <div className="card-body">
                <img
                  style={{"width":"300px"}}
                  src={`https://ipfs.infura.io/ipfs/${product.imageHash}`}
                  alt=""
                />
                <h3 className="card-title pricing-card-title">
                  {product.name}
                </h3>
                <p>{product.description}</p>

                <h5>Price: {product.price} cUSD</h5>
                <h5>Quantity: {product.quantity}</h5>
                <div className="d-flex justify-content-between">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="How many do you want to buy"
                    onChange={(e) => setBuyQuantity(e.target.value)}
                  />
                </div>
                {props.address === product.owner && 
                  <>
                    <h5>Edit Quantity</h5>
                    <div className="d-flex justify-content-between">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Quantity"
                        onChange={(e) => setEditQuantity(e.target.value)}
                      />
                    </div>
                  </>
                }
                <div className="row">
                  <div className="col-6">
                    <button
                      onClick={() => buyProduct(product.index)}
                      className="btn btn-outline-primary"
                    >
                      Buy
                    </button>
                  </div>
                  {props.address === product.owner && <div className="col-6">
                    <button
                      onClick={() => editQuantityHandler(product.index)}
                      className="btn btn-outline-primary"
                    >
                      Edit
                    </button>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="row">
        <div className="col-6">
          <form onSubmit={formHandler}>
            <h2>Add your product</h2>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={5}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">{image.name}</label>
              <input
                type={"file"}
                required
                accept="image/gif, image/jpeg, image/png"
                name="image"
                id="store-image"
                onChange={handleImageChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Farmer;
