import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect, useState, useCallback } from "react";
import { loadContract } from "./utils/load-contract";
function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });
  const [balance, setBalance] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [reload, setReload] = useState(false);

  const reloadEffect = () => {
    setReload(!reload);
  };
  // const setAccountListener = (provider) => {
  //   provider.on("accountsChanged", (accounts) => {
  //     setAccount(accounts[0]);
  //   });
  // };
  // useEffect(() => {
  //   const loadProvider = async () => {
  //     const provider = await detectEthereumProvider();

  //     const contract = await loadContract("Funder", provider);

  //     if (provider) {
  //       setAccountListener(provider);
  //       setWeb3Api({
  //         web3: new Web3(provider),
  //         provider,
  //         contract,
  //       });
  //     } else {
  //       console.error("Please,install Metamask");
  //     }
  //   };
  //   loadProvider();
  // }, []);
  useEffect(() => {
    const loadProvider = async () => {
      const provider = "HTTP://127.0.0.1:8545";

      const contract = await loadContract("Funder", provider);

      if (provider) {
        // setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
        });
      } else {
        console.error("Provider does not exist");
      }
    };
    loadProvider();
  }, []);
  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };
    web3Api.contract && loadBalance();
  }, [web3Api, reload]);
  // useEffect(() => {
  //   const getAccount = async () => {
  //     const accounts = await web3Api.web3.eth.getAccounts();
  //     //console.log(accounts);
  //     ////////////////
  //     setAccount(accounts[0]);
  //   };
  //   web3Api.web3 && getAccount();
  // }, [web3Api.web3]);
  useEffect(() => {
    const allAccounts = async () => {
      var select = document.getElementById("selectNumber");
      var options = await web3Api.web3.eth.getAccounts();

      for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
      }
    };
    web3Api.web3 && allAccounts();
  }, [web3Api.web3]);

  const transferFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    await contract.transfer({
      from: account,
      value: web3.utils.toWei("1", "ether"),
    });
    reloadEffect();
  }, [web3Api, account]);

  const withdrawFunds = async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei("1", "ether");
    await contract.withdraw(withdrawAmount, {
      from: account,
    });
    reloadEffect();
  };
  const selectAccount = async () => {
    const { web3 } = web3Api;
    let selectedAccountAddress = document.getElementById("selectNumber").value;
    let accountBalance = await web3.eth.getBalance(selectedAccountAddress);

    setAccount(selectedAccountAddress);
    setAccountBalance(web3.utils.fromWei(accountBalance, "ether"));
  };

  return (
    <>
      <form id="myForm">
        <select id="selectNumber" onChange={selectAccount}>
          <option>Choose an account</option>
        </select>
      </form>
      <div className="faucet-wrapper">
        <div className="faucet">
          <span>
            <strong>Account:</strong>
          </span>
          {account ? <div>{account}</div> : <p>Select from above addresses</p>}
          <span>
            <strong>Account Bal:</strong>
          </span>
          {accountBalance ? (
            <div>{accountBalance}</div>
          ) : (
            <p>Select an account</p>
          )}

          <div className="balance-view is-size-2">
            Current Contract Balance: <strong>{balance}</strong> ETH
          </div>

          <button className="btn mr-2" onClick={transferFunds}>
            Donate
          </button>
          <button className="btn" onClick={withdrawFunds}>
            Withdraw
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
