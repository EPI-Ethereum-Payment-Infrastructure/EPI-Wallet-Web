import _ from "lodash";
import React, { useContext } from "react";
import { ChainContext } from "..";
import { INFURA_API_KEY } from "../helpers/Web3";

const useChainContext = () => {
    const [state, dispatch]= useContext(ChainContext);
    let preferredRpcUrl = _.get(state, 'rpc[0]');
    console.log("preferredRpc: ", preferredRpcUrl);
    preferredRpcUrl = _.replace(preferredRpcUrl, 'INFURA_API_KEY', INFURA_API_KEY)
    return [preferredRpcUrl, dispatch];
}

export default useChainContext;