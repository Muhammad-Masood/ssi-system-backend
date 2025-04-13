export const contract_address = "0xb3DE997e2AEA6F7813aF899581d4a9307121b692";
export const contract_abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "cidHash",
        type: "bytes",
      },
    ],
    name: "CIDIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "cidHash",
        type: "bytes",
      },
    ],
    name: "CIDRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "didHash",
        type: "bytes",
      },
    ],
    name: "DeletedDID",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "didIndex",
        type: "uint8",
      },
    ],
    name: "removeResolvableDIDHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "cidHash",
        type: "bytes",
      },
    ],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "hash",
        type: "bytes",
      },
    ],
    name: "setIssuedCertificateHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "didHash",
        type: "bytes",
      },
    ],
    name: "setResolvableDIDHash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
    ],
    name: "addressToRevokedCIDS",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "publicKey",
        type: "address",
      },
    ],
    name: "retrieveResolvableDIDHash",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
    ],
    name: "userToIssuedCertificates",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
    ],
    name: "userToOwnedCertificates",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const test_contract_address = "";

export const test_contract_abi = [];
