import * as nip19 from "nostr-tools/nip19";
import { useState, useEffect } from "react";
import { SimplePool } from "nostr-tools/pool";
import { Share2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/dialog";
import { QRCodeCanvas } from "qrcode.react";
import api from "./services/api";
import Confetti from "react-confetti"
import PaidLoading from "./assets/paid.json"
import LoadingAddress from "./assets/loadingAddress.json"
import Lottie from "lottie-react";
import { motion } from "framer-motion";

function Donation() {
  const [txid, setTxid] = useState("");
  const [paid, setPaid] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");
  const [commentAllowed, setcommentAllowed] = useState(500)
  const [picture, setPicture] = useState("");
  const [banner, setBanner] = useState("");
  const [about, setAbout] = useState("");
  const [nip05, setNip05] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [address, setAddress] = useState("");
  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false)
  const [shareText, setShareText] = useState("Share");
  const { nostrID } = useParams();

  async function fetchProfile() {
    const pool = new SimplePool();
    const { data } = nip19.decode(String(nostrID));

    await pool.subscribeMany(
      [
        "wss://strfry.iris.to/",
        "wss://relay.damus.io/",
        "wss://relay.nostr.band/",
        "wss://relay.snort.social/",
      ],
      [
        {
          kinds: [0],
          authors: [data.toString()],
        },
      ],
      {
        onevent(event) {
          const content = JSON.parse(event.content);
          setDisplayName(content?.display_name || content?.name);
          setAbout(content?.about);
          setPicture(content?.picture);
          setBanner(content?.banner);
          setNip05(content?.nip05valid || content?.nip05);
          setLightningAddress(content?.lud16);
          console.log("got event:", content);
        },
      }
    );
  }

  function handleAmountChange(e: any) {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (lightningAddress) {
      api.getInfo(lightningAddress).then((r) => {
        const data = r.data
        setMaxValue(data?.max_value);
        setMinValue(data?.min_value);
        setcommentAllowed(data?.comment_allowed);
      })
    }
  }, [lightningAddress])

  useEffect(() => {
    if (txid) {
      const interval = setInterval(() => {
        api.getPaymentPaid(txid).then((r) => {
          const data = r.data;
          setPaid(data.paid);
          if (data.paid) {
            clearInterval(interval); 
          }
        });
      }, 10000);

      return () => clearInterval(interval); 
    }
  }, [txid]);

  const isFormComplete = () => amount && description;

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareText("Copied");
    setTimeout(() => setShareText("Share"), 1000);
  };

  return (
    <motion.div
      className="font-sans h-screen bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {
        paid && <Confetti />
      }
      <div className="max-w-4xl mx-auto overflow-hidden h-full bg-white shadow-lg">
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col">
            <div className="w-full flex justify-center overflow-hidden">
              {banner ? (
                <img
                  src={banner}
                  alt="Banner"
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 w-full object-cover bg-orange-300" />
              )}
            </div>
            <div className="relative rounded-3xl flex flex-col items-center mt-[-40px]">
              {picture ? (
                <img
                  src={picture}
                  alt="Profile Picture"
                  className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white" />
              )}

              <div className="flex w-full justify-center flex-row gap-3 items-center mt-2">
                <h2 className="text-xl md:text-2xl font-semibold">
                  {displayName}
                </h2>
              </div>
              <p className="mt-4 max-w-3xl text-sm md:text-base text-gray-700 text-center px-4 md:px-8">
                {about || "No biography"}
              </p>
              <button
              onClick={handleShareClick}
              className="flex items-center mt-4 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-200"
            >
              <Share2 className="mr-2" size={18} />
              {shareText}
            </button>
            </div>
          </div>

          <div className="p-6 md:p-12">
            <h3 className="text-lg md:text-xl font-semibold">
              Support {displayName}
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-4">
              Choose an amount to donate
            </p>

            <div className="flex space-x-2 mb-4">
              {["1", "10", "15"].map((presetAmount) => (
                <button
                  key={presetAmount}
                  onClick={() => setAmount(presetAmount)}
                  className={`bg-green-100 text-green-600 px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-green-200 transition duration-200 ${
                    amount === presetAmount ? "bg-green-500 text-white" : ""
                  }`}
                >
                  ${presetAmount}
                </button>
              ))}
              <input
                type="number"
                className="w-20 md:w-28 px-2 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="$0.00"
                value={Number(amount)}
                onChange={handleAmountChange}
                max={maxValue}
                min={minValue}
              />
            </div>

            <textarea
              className="w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Say something here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={commentAllowed}
            ></textarea>
            <div className=" flex justify-end">
              <p className=" text-sm text-gray-500">{description.length} / {commentAllowed}</p>
            </div>
            {isFormComplete() && (
              <div className="mt-4">
                <h4 className="text-base font-semibold">Payment Method</h4>
                <p className="text-sm md:text-base text-gray-500">
                  Choose the payment method to make your donation.
                </p>
                <div className="flex space-x-4 mt-2">
                  {["Lightning", "Liquid", "PIX"].map((method) => (
                    <button
                      key={method.toLowerCase()}
                      onClick={() => setPaymentMethod(method.toLowerCase())}
                      className={`px-4 py-2 md:px-6 md:py-3 border rounded-full ${
                        paymentMethod === method.toLowerCase()
                          ? "bg-green-500 text-white"
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(!dialogOpen)}>
              <DialogTrigger className="w-full" disabled={!lightningAddress || !isFormComplete() || !paymentMethod}>
                <button
                  disabled={!lightningAddress || !isFormComplete() || !paymentMethod}
                  className="w-full h-12 md:h-14 bg-green-500 text-white disabled:bg-slate-400 mt-4 py-2 md:py-3 rounded-lg flex justify-center items-center hover:bg-green-600 transition duration-200"
                  onClick={() => {
                    setLoadingAddress(true)
                    api.createAddress(
                      String(nostrID), 
                      Number(amount.replace("$", "")), 
                      paymentMethod, 
                      description,
                      lightningAddress
                    ).then((r) => {
                      const data = r.data;
                      setAddress(data?.address);
                      setTxid(data?.txid);
                    }).finally(() => {
                      setLoadingAddress(false)
                    });
                  }}
                >
                  <img
                    src="https://static-00.iconduck.com/assets.00/money-with-wings-emoji-1024x860-325l9x4i.png"
                    alt="Donate Icon"
                    className="w-5 h-5 mr-2 md:w-6 md:h-6"
                  />
                  Take My Money
                </button>
              </DialogTrigger>
              <DialogContent className="flex flex-col gap-5 p-6 md:p-8">
                <DialogHeader>
                  {
                    !paid ? (
                      <>
                        <DialogTitle className="text-lg md:text-xl flex flex-row gap-2 font-semibold text-start">
                          <img
                            src="https://static-00.iconduck.com/assets.00/money-with-wings-emoji-1024x860-325l9x4i.png"
                            alt="Donate Icon"
                            className="w-5 h-5 mr-2 md:w-6 md:h-6"
                          />
                          Make your donation of $ {amount}
                        </DialogTitle>
                        <DialogDescription className="text-sm md:text-base text-gray-500 text-start">
                          Scan the code above with your payment app to donate via {paymentMethod}.
                        </DialogDescription>   
                      </>
                    ) : (
                      <>
                        <DialogTitle className="text-lg md:text-xl flex flex-row gap-2 font-semibold text-start">
                          Thank you for the donation! 🎉
                        </DialogTitle>
                        <DialogDescription className="text-sm md:text-base text-gray-500 text-start">
                          Your donation has been successfully sent!
                        </DialogDescription>   
                      </>
                    )
                  }
                </DialogHeader>
                {
                  loadingAddress && (
                    <div className="flex justify-center flex-col w-full items-center">
                      <Lottie 
                          loop={true} 
                          animationData={LoadingAddress} style={{ height: 350, width: 250 }} 
                      />
                      <p>Generating your payment address...</p>
                    </div>
                  )
                }
                {address && !paid && (
                  <a className="flex justify-start" href={address}>
                      <QRCodeCanvas
                        value={address}
                        size={256}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                      />
                  </a>
                )}
                {
                  paid && (
                    <div className="flex justify-start">
                      <Lottie 
                          loop={false} 
                          animationData={PaidLoading} style={{ height: 350, width: 250 }} 
                      />
                    </div>
                  )
                }
                {
                  !paid && (
                    <div className=" w-full flex flex-col gap-2">
                      <input className=" w-full disabled:text-primary/50" value={address} disabled={true}/>
                    </div>
                  )
                }
                {
                  paid && (
                    <DialogClose className=" bg-green-600  text-white h-14 rounded">
                      Close
                    </DialogClose>
                  )
                }
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Donation;
