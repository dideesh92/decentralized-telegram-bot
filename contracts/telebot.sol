// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract UserContract {
    struct User {
        string name;
        uint8 age;
        string gender;
        string userAddress;
    }

    mapping(address => User) private users;

    function addUser(string memory _name, uint8 _age, string memory _gender, string memory _userAddress) public {
        users[msg.sender] = User(_name, _age, _gender, _userAddress);
    }

    function getUser(address _user) public view returns (string memory, uint8, string memory, string memory) {
        User memory user = users[_user];
        return (user.name, user.age, user.gender, user.userAddress);
    }
}
