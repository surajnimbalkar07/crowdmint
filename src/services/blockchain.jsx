import abi from '../abis/src/contracts/Genesis.sol/Genesis.json';
import address from '../abis/contractAddress.json';
import { getGlobalState, setGlobalState } from '../store';
import { ethers } from 'ethers';

const { ethereum } = window;
const contractAddress = address.address;
const contractAbi = abi.abi;
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia chain ID in hex

let tx;

// Connect the user's wallet
const connectWallet = async () => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    await switchToSepolia();
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase());
    alert('Successfully connected to Sepolia');
  } catch (error) {
    reportError(error);
  }
};

// Ensure the user is connected to Sepolia
const switchToSepolia = async () => {
  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    }
  } catch (error) {
    console.error('Error switching to Sepolia:', error);
    throw new Error('Please switch to the Sepolia Testnet in Metamask');
  }
};

// Check if the wallet is already connected
const isWalletConnected = async () => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    await switchToSepolia();
    setGlobalState('connectedAccount', accounts[0]?.toLowerCase());

    ethereum.on('chainChanged', () => window.location.reload());
    ethereum.on('accountsChanged', async () => await isWalletConnected());

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0]?.toLowerCase());
    } else {
      alert('Please connect wallet.');
    }
  } catch (error) {
    reportError(error);
  }
};

// Get the Ethereum contract instance with Sepolia provider
export const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractAbi, signer);
  return contract;
};

// Create a new project
const createProject = async ({ title, description, imageURL, cost, expiresAt }) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    const contract = await getEthereumContract();
    const parsedCost = ethers.utils.parseEther(cost);

    tx = await contract.createProject(title, description, imageURL, parsedCost, expiresAt);
    await tx.wait();
    await loadProjects();
  } catch (error) {
    console.error("Smart contract error:", error);
    reportError(error);
  }
};

// Update an existing project
const updateProject = async ({ id, title, description, imageURL, expiresAt }) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    const contract = await getEthereumContract();

    tx = await contract.updateProject(id, title, description, imageURL, expiresAt);
    await tx.wait();
    await loadProject(id);
  } catch (error) {
    reportError(error);
  }
};

// Delete a project
const deleteProject = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    const contract = await getEthereumContract();
    await contract.deleteProject(id);
  } catch (error) {
    reportError(error);
  }
};

// Load all projects
const loadProjects = async () => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    
    const contract = await getEthereumContract();
    const projects = await contract.getProjects();
    const stats = await contract.stats();

    setGlobalState('stats', structureStats(stats));
    setGlobalState('projects', structuredProjects(projects));
  } catch (error) {
    reportError(error);
  }
};

// Load specific project details
const loadProject = async (id) => {
  try {
    if (!ethereum) return alert('Please install Metamask');
    const contract = await getEthereumContract();
    const project = await contract.getProject(id);

    setGlobalState('project', structuredProjects([project])[0]);
  } catch (error) {
    alert(JSON.stringify(error.message));
    reportError(error);
  }
};

// Back a project with a donation
const backProject = async (id, amount) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    await switchToSepolia();
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getEthereumContract();
    const parsedAmount = ethers.utils.parseEther(amount);

    tx = await contract.backProject(id, {
      from: connectedAccount,
      value: parsedAmount._hex,
    });

    await tx.wait();
    await getBackers(id);
  } catch (error) {
    reportError(error);
  }
};

// Get backers of a project
const getBackers = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    const contract = await getEthereumContract();

    const backers = await contract.getBackers(id);
    setGlobalState('backers', structuredBackers(backers));
  } catch (error) {
    reportError(error);
  }
};

// Payout a project's funds
const payoutProject = async (id) => {
  try {
    if (!ethereum) throw new Error('Please install Metamask');
    await switchToSepolia();
    const connectedAccount = getGlobalState('connectedAccount');
    const contract = await getEthereumContract();

    tx = await contract.payoutProject(id, { from: connectedAccount });
    await tx.wait();
    await getBackers(id);
  } catch (error) {
    reportError(error);
  }
};

// Helper functions to structure the data
const structuredBackers = (backers) =>
  backers.map((backer) => ({
    owner: backer.owner.toLowerCase(),
    refunded: backer.refunded,
    timestamp: new Date(backer.timestamp.toNumber() * 1000).toJSON(),
    contribution: ethers.utils.formatEther(backer.contribution),
  })).reverse();

const structuredProjects = (projects) =>
  projects.map((project) => ({
    id: project.id.toNumber(),
    owner: project.owner.toLowerCase(),
    title: project.title,
    description: project.description,
    timestamp: new Date(project.timestamp.toNumber()).getTime(),
    expiresAt: new Date(project.expiresAt.toNumber()).getTime(),
    date: toDate(project.expiresAt.toNumber() * 1000),
    imageURL: project.imageURL,
    raised: ethers.utils.formatEther(project.raised),
    cost: ethers.utils.formatEther(project.cost),
    backers: project.backers.toNumber(),
    status: project.status,
  })).reverse();

const toDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const structureStats = (stats) => ({
  totalProjects: stats.totalProjects.toNumber(),
  totalBacking: stats.totalBacking.toNumber(),
  totalDonations: ethers.utils.formatEther(stats.totalDonations),
});

const reportError = (error) => {
  console.error(error.message);
  throw new Error('An error occurred. Please check the console for details.');
};

// Export functions for use in the app
export {
  connectWallet,
  isWalletConnected,
  createProject,
  updateProject,
  deleteProject,
  loadProjects,
  loadProject,
  backProject,
  getBackers,
  payoutProject,
};
