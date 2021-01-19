# DIADATA-LOMBARD-BRIDGE

---
This MVP ensures that 2 contracts on different chains maintain the same state.

---

## Usage

`docker build -t diadata-lombard-bridge:latest -f Dockerfile .` <br>
`docker run -e 'privateKeys=xxxxxxxxxxx' diadata-lombard-bridge:latest`

---

## Playbooks

---

### To add new providers

1. Get the HTTP/WS url and follow the provider config format as mentioned below
```yaml
- url: "wss://eth-mainnet.ws.alchemyapi.io/v2/oFT4VovUd2RoaXwFAjIPvD3i2aA2KQ6k"
      config:
        priority: 1
        stallTimeout: 200
        weight: 2
      networkId: 1
```
2. Make sure you use the same network Id for all the providers in the same network!
3. Explanation of prioriy, stallTimeout and weight:

`Priority`: The priority used for the provider. Higher priorities are favoured over lower priorities. If multiple providers share the same priority, they are chosen at random.

`stallTimeout`: The timeout (in ms) after which another Provider will be attempted. This does not affect the current Provider; if it returns a result it is counted as part of the quorum.Lower values will result in more network traffic, but may reduce the response time of requests.

`weight`: The weight a response from this provider provides. This can be used if a given Provider is more trusted, for example.

### To add new contracts

1. Add the abi in the artifacts directory (array / solc output)
2. Append the list in the config.yaml -> contracts subheader
3. Make sure that all the fields are used, example - 
```yaml
- name: "TEST"
    # Number of block confirmations before tx must be sent
    blockConfirmations:
      # Source chain
      sourceChain: 6
      # Destination chain
      targetChain: 6
    # Time to wait before sending another tx. Essentially would move this into something dynamic
    interval: 300
    # Contract which has more weight than the other (source of truth)
    sourceContract:
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      pathToArtifact: "artifacts/TetherToken.json"
      eventsToWatch:
        - "Transfer"
    # Destination Contract
    targetContract:
      address: "0x26d80fFc9c0cB79EB91B606DD6A05654C88e2Ec8"
      pathToArtifact: "artifacts/BridgeTarget.json"
      eventsToWatch:
        - "DepositToken"
    # Limit of Ratio to be kept between contracts(percentage)
    healthRatio: 0.90
```



