/**
 * @author Arvind Kalra <kalarvind97@gmail.com>
 * @profile https://github.com/arvindkalra
 * @date 17/04/22
 */
import {Button, Empty, InputNumber, Space, Spin} from "antd";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { fetchMessages, sendMessageForRequest } from "../../api";
import CryptoTransferMessage from "../../components/CryptoTransferMessage";
import { useNavigate } from "react-router-dom";
import useQuery from "../../hooks/useQuery";
import MainLayout from "../../components/Layouts/MainLayout";
import useUserDetails from "../../hooks/useUserDetails";
import {toTitleCase} from "../../helpers";

const ChatPage = () => {
  const [newMessageAmount, setNewMessageAmount] = useState(0);
  const [userDetails, usersLoaded] = useUserDetails();
  const [isLoading, setIsLoading] = useState(true);
  const messagesElement = useRef(null);
  const [messagesArray, setMessageArray] = useState();
  const navigate = useNavigate();
  const query = useQuery();
  const to = query.get("to");

  const threadUser = _.get(userDetails, to, {});

  const [shouldShowErrorState, setShouldShowErrorState] = useState(false);

  useEffect(() => {
    if (!usersLoaded) {
      return;
    }

    if (_.isEmpty(threadUser)) {
      setIsLoading(false);
      setShouldShowErrorState(true);
      return;
    }

    fetchMessages(to).then((res) => {
      setMessageArray(res.messages);
      setIsLoading(false);
    });
  }, [usersLoaded]);

  const handleSend = () =>
    navigate(`/transaction?to=${to}&amount=${newMessageAmount}`);

  const handleRequest = () => {
    sendMessageForRequest({
      newMessageAmount,
      threadUserName: to,
    })
      .then(() => {
        setNewMessageAmount(0);
        return fetchMessages(to);
      })
      .then((res) => setMessageArray(res.messages))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (isLoading || shouldShowErrorState) {
      return;
    }

    if (messagesElement) {
      const { current: ele } = messagesElement;
      ele.scroll({ top: ele.scrollHeight, behavior: "smooth" });

      messagesElement.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: "smooth" });
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="fullpage-loader">
        <Space size="middle">
          <Spin size="large" />
        </Space>
      </div>
    );
  }

  if (shouldShowErrorState) {
    return (
      <MainLayout
        onBackClick={() => navigate('/')}
      >
        <div className="chat-page-error-state">
          <Empty
            description="User does not exist in the EPI Database"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      hideLogo
      className="chat-page"
      showAppName={false}
      onBackClick={() => navigate('/')}
      headerTitle={toTitleCase(threadUser.name)}
    >
      <div className="chat-page-messages" ref={messagesElement}>
        {_.map(_.orderBy(messagesArray, ["createdAt"], ["asc"]), (message) => (
          <CryptoTransferMessage
            key={message.id}
            message={message}
            handleApprove={() =>
              navigate(
                `/transaction?to=${to}&amount=${parseFloat(
                  message.amount
                )}&transactionId=${message.transactionId}`
              )
            }
          />
        ))}
      </div>
      <div className="chat-page-input">
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Amount"
          onChange={setNewMessageAmount}
          value={newMessageAmount}
        />
        <Button
          type="primary"
          onClick={handleRequest}
          disabled={!_.isNumber(newMessageAmount) || newMessageAmount <= 0}
        >
          Request
        </Button>
        <Button
          type="primary"
          onClick={() => {
            handleSend();
          }}
          disabled={!_.isNumber(newMessageAmount) || newMessageAmount <= 0}
        >
          Send
        </Button>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
