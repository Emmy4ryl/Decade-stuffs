import { useState, useEffect } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";

import Navbar from "./components/Navbar";
import Farmer from "./components/Farmer";
import storyslot from "./contracts/farmer.abi.json";
import IERC20 from "./contracts/IERC.abi.json";

const ERC20_DECIMALS = 18;

const contractAddress = "0xf487400C22D391a422899Fa809b08ceb433a47C6";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [celoBalance, setCeloBalance] = useState(0);
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (contract) {
      getProducts();
    }
  }, [contract]);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    } else {
      console.log("no kit");
    }
  }, [kit, address]);

  const connect = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];

        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Not connected");
    }
  };

  const getBalance = async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const celoBalance = balance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(storyslot, contractAddress);
      setcontract(contract);
      setCeloBalance(celoBalance);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  };

  const getProducts = async () => {
    try {
      const productLength = await contract.methods.getProductLength().call();
      // const productLength = await contract.getProductLength()
      const _products = [];

      for (let index = 0; index < productLength; index++) {
        let _product = new Promise(async (resolve, reject) => {
          let product = await contract.methods.getProduct(index).call();
          // let product = await contract.getProduct(index);
          resolve({
            index: index,
            owner: product[0],
            name: product[1],
            description: product[2],
            imageHash: product[3],
            quantity: product[4],
            price: product[5],
          });
        });
        _products.push(_product);
      }
      const products = await Promise.all(_products);
      console.log(products);
      setProducts(products);
    } catch (error) {
      console.log(error);
    }
  };

  const createProduct = async (name, description, image, quantity, price) => {
    try {
      await contract.methods
        .addProduct(name, description, image, quantity, price)
        .send({ from: address });
      getProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const buyProduct = async (_index, _quantity) => {
    const cUSDContract = new kit.web3.eth.Contract(IERC20, cUSDContractAddress);

    try {
      const amount = new BigNumber(products[_index].price)
        .shiftedBy(ERC20_DECIMALS)
        .toString();
      if (products[_index].quantity <= 0) return;
      await cUSDContract.methods
        .approve(contractAddress, amount)
        .send({ from: address });
      await contract.methods
        .confirmBuy(_index, _quantity)
        .send({ from: address });
      getBalance();
      getProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const editQuantity = async(_index, _quantity)=>{
    try {
      await contract.methods
        .editQuantity(_index, _quantity)
        .send({ from: address });
      getProducts();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <Navbar balance={cUSDBalance} />
      <Farmer
        products={products}
        createProduct={createProduct}
        buyProduct={buyProduct}
        editQuantity = {editQuantity}
        address={address}
      />
    </div>
  );
}

export default App;
