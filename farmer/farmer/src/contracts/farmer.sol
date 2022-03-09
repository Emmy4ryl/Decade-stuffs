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

    struct Product{
        address payable owner;
        string name;
        string description;
        string imageHash;
        uint quantity;
        uint price;
    }
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;


    mapping(uint => Product) products;
    uint productLength = 0;

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
    }

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

    function editQuantity(uint _index, uint _quantity)public{
        require(msg.sender == products[_index].owner, "Not the owner");
        products[_index].quantity = _quantity;
    }

    function confirmBuy(uint _index , uint _quantity) public payable{
      require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                products[_index].owner,
                products[_index].price * _quantity
            ),
            "Transaction could not be performed"
        );
        products[_index].quantity--;
    }

    function getProductLength () public view returns (uint){
        return (productLength);
    }
}