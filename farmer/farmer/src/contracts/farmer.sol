// SPDX-License-Identifier: MIT  

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Farmer{

//Struct which contains all the properties of the product
    struct Product{
        address payable owner;
        string name;
        string description;
        string imageHash;
        uint quantity;
        uint price;
    }

//Address of the cUsd token thorugh which the transaction occurs
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;


    //Mapping to store all the products by giving it an index value
    mapping(uint => Product) products;

    //Stores the number of products and serves as the index number for the products
    uint productLength = 0;

    //Event that will emit when a  new product is added
    event newProduct(address indexed owner, uint price);
    event productBought(address indexed seller, uint price, uint index, address indexed buyer);


    //Function to add a product in the dapp
    function addProduct(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        uint _quantity,
        uint _price
    )public {
        products[productLength] = Product(
            payable(msg.sender),
            _name,
            _description,
            _imageHash,
            _quantity,
            _price
        );
        productLength++;
        emit newProduct(msg.sender, _price);
    }

    //Funciton used to retrieve products and render them for the user
    function getProduct(uint _index) public view returns(
        address payable,
        string memory,
        string memory,
        string memory,
        uint,
        uint
    ){
        Product storage product = products[_index];
        return(
            product.owner,
            product.name,
            product.description,
            product.imageHash,
            product.quantity,
            product.price
        );
    }

    //Function through which only the owner can change the quantity of the products listed
    function editQuantity(uint _index, uint _quantity)public{
        require(msg.sender == products[_index].owner, "Only the owner could change the quantity of items");
        products[_index].quantity = _quantity;
    }

    //A buy Function which transfers cUsd from the buyer to the seller according to the quantity of the products he is buying
    function confirmBuy(uint _index , uint _quantity) public payable{
        require(products[_index].quantity - _quantity > 0, "can't buy more than the listed quantity");
        require(products[_index].owner != msg.sender, "You can't buy your own product");
        uint totalPrice = products[_index].price * _quantity;
      require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                products[_index].owner,
                totalPrice
            ),
            "Transaction could not be performed"
        );
        products[_index].quantity--;
        emit productBought(products[_index].owner,totalPrice,_index,msg.sender);
    }

    //Function used to see the total number of products listed
    function getProductLength () public view returns (uint){
        return (productLength);
    }
}

/*
1) Added a require statement to buy function to check if the user specified quantity is 
    available in the quantity listed by the seller, If not user will recieve the custom error
    provided in the require statement
2)Also added a require statement in the buy functiuon which restricts the user from buying his own products
3)Added useful events
4)Added comments in the code for documentation purpose
*/