import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { contractABI } from "./abi";
import { Bars } from "react-loader-spinner";

function App() {
  useEffect(() => {
    connectWallet();
  });

  const [buttonText, setButtonText] = useState("Connect Wallet");
  const [walletAddress, setWalletAddress] = useState("");
  const contractAddress = "0x622FbA36A0FAd0Cc26d28040f9f2b514455E2358";
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  let contract = null;
  let provider = null;
  let signer = null;

  async function connectWallet() {
    if (window.ethereum == null) {
      console.log("MetaMask not installed!");
      alert("Please install MetaMask first.");
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      setWalletAddress(signer.address);
      setButtonText("Connected");
      initContract();
    }
  }

  async function initContract() {
    contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer || provider
    );
    getBalance();
  }

  async function getBalance() {
    const balance = await provider.getBalance(contractAddress);
    setBalance(ethers.formatEther(balance));
  }

  async function donate() {
    setLoading(true);
    const amount = document.getElementById("amount").value;
    if (amount < 0.1) {
      alert("Minimum amount is 0.1 ETH");
      return;
    } else {
      console.log(`Donating ${amount} ETH`);
      const tx = await contract.FundEth({ value: ethers.parseEther(amount) });
      await tx.wait();
      getBalance();
      alert("Donation Successful!");
    }
    setLoading(false);
  }

  async function withdraw() {
    try {
      const tx = await contract.withdraw({ value: ethers.parseEther("0") });
      await tx.wait();
      getBalance();
      alert("Withdrawal successful!");
    } catch (err) {
      console.log(err.code, err.message);
      if (err.message.includes("Only owner can withdraw")) {
        alert("Only owner can withdraw");
      } else {
        alert("Error withdrawing funds");
      }
    }
  }

  return (
    <div className="App">
      <h1>Ethers Fund Me</h1>
      <h3>Funding app with Ethers.js</h3>

      <p>
        Get some test ETH :{" "}
        <a href="https://sepoliafaucet.com/" target="_blank" rel="noreferrer">
          Sepolia Faucet
        </a>
      </p>
      <button onClick={connectWallet}>{buttonText}</button>
      <h5>{walletAddress ? `Wallet Address: ${walletAddress}` : ""}</h5>

      <h4>{balance ? `Current Funds: ${balance} ETH` : ""}</h4>
      <p>Minimum donation amount is 0.1 ETH</p>

      <Bars
        height="40"
        width="40"
        color="#6e37e1"
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={loading}
      />

      <input
        className="input"
        type="number"
        id="amount"
        name="amount"
        min="0.1"
        step="0.1"
        placeholder="Enter amount in ETH"
      />
      <button className="button" onClick={donate}>
        Donate
      </button>
      <div>
        <button className="button" onClick={withdraw}>
          Withdraw
        </button>
      </div>

      <p>
        You can find the transactions on{" "}
        <a
          href="https://sepolia.etherscan.io/address/0x622FbA36A0FAd0Cc26d28040f9f2b514455E2358"
          target="_blank"
          rel="noreferrer"
        >
          Sepolia Etherscan.
        </a>
      </p>
      <p>
        Made with ❤️ by{" "}
        <a href="https://pratikkale.in" target="_blank" rel="noreferrer">
          Pratik Kale |{" "}
          <a
            href="https://github.com/pratikkalein/ethers-fund-me"
            target="_blank"
            rel="noreferrer"
          >
            Source Code
          </a>
        </a>
      </p>
    </div>
  );
}

export default App;
