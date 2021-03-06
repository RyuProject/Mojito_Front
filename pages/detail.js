import Head from "next/head"
import { useState, useEffect } from "react"
import useWallet from "use-wallet"
import { Link, withTranslation } from "../i18n"
import HeaderFooter from "../layout/HeaderFooter"
import classNames from "classnames/bind"
import { confirmAlert } from 'react-confirm-alert'
import { ToastContainer, toast } from 'react-toastify'
import { withRouter } from "next/router"
import styles from "../styles/detail.less"

import { getAccountBalance, getPrice, batchCreate, autoBuy, autoSell } from "../api/api"

const Home = ({ t, router }) => {

    const symbol = router?.query?.symbol
    const [balance, setBalance] = useState([])
    const [price, setPrice] = useState([])

    const [bLowPrice, setBLowPrice] = useState(0)
    const [bHighPrice, setBHighPrice] = useState(0)
    const [bAsset, setBAsset] = useState(0)
    const [bAmount, setBAmount] = useState(0)

    const [sLowPrice, setSLowPrice] = useState(0)
    const [sHighPrice, setSHighPrice] = useState(0)
    const [sAsset, setSAsset] = useState(0)
    const [sAmount, setSAmount] = useState(0)

    const [aLowPrice, setALowPrice] = useState(0)
    const [aHighPrice, setAHighPrice] = useState(0)
    const [aTimes, setATimes] = useState(0)
    const [aAmount, setAAmount] = useState(0)
    const [aStart, setAStart] = useState(false)

    const [asLowPrice, setAsLowPrice] = useState(0)
    const [asHighPrice, setAsHighPrice] = useState(0)
    const [asTimes, setAsTimes] = useState(0)
    const [asAmount, setAsAmount] = useState(0)
    const [asStart, setAsStart] = useState(false)

    useEffect(async () => {
        const timer = setInterval(async () => {
            const accountBalance = await getAccountBalance()
            setBalance(accountBalance?.WALLET)
            const price = await getPrice(symbol)
            setPrice(price)
        }, 3000)
        return () => {
            clearInterval(timer)
        }
    }, [])

    const orderBuy = async () => {
        let orders = []

        let spreads = (bHighPrice - bLowPrice) / bAmount

        for(var i = 0; i < bAmount; i++){
          const orderPrice = (bHighPrice * 1 - i * spreads - spreads * ((Math.random() * 50 + 50) / 100)).toFixed(2)
          orders.push({
              volume: (parseFloat(bAsset) * ((Math.random() * 70 + 50) / 100)).toFixed(5),
              price: orderPrice,
              direction: "BID",
              symbol: symbol,
              source: "WALLET",
              type: "LIMIT",
          })
        }
        
        console.log(orders)
        const orderList = await batchCreate(JSON.stringify(orders))
        console.log(orderList)

    }

    const orderSell = async () => {
        let orders = []

        let spreads = (sHighPrice - sLowPrice) / sAmount

        for (var i = 0; i < sAmount; i++) {
            const orderPrice = (sLowPrice * 1 + i * spreads + spreads * ((Math.random() * 50 + 50) / 100)).toFixed(2)
            orders.push({
                volume: (parseFloat(sAsset) * ((Math.random() * 70 + 50) / 100)).toFixed(5),
                price: orderPrice,
                direction: "ASK",
                symbol: symbol,
                source: "WALLET",
                type: "LIMIT",
            })
        }

        console.log(orders)
        const orderList = await batchCreate(JSON.stringify(orders))
        console.log(orderList)
    }

    let aTimer = null
    const autoStart = async () => {
        const nowPrice = price[0].price
        console.log("?????????", nowPrice, aHighPrice, aStart)

        if (aTimes <= 0){
            alert("????????????????????????0!")
        }
        aTimer = setInterval(() => {
             if (nowPrice > aHighPrice) {
                //  console.log(aTimer)
                //  if (!!aTimer) {
                //      aTimer.clearInterval()
                //  }
                 console.log("????????????,?????????!")
                 return
             }
            if (nowPrice >= aLowPrice && !aStart) {
                console.log("????????????", aAmount, "???")
                autoBuy(aAmount)
            }
        }, aTimes * 1000)

    }

    let asTimer = null
    const autosStart = async () => {
        const nowPrice = price[0].price
        console.log("?????????", nowPrice, asHighPrice)
        if (asTimes <= 0) {
            alert("????????????????????????0!")
        }
        asTimer = setInterval(() => {
            if (nowPrice < asHighPrice) {
                // if (!!asTimer) {
                //     asTimer.clearInterval()
                // }
                console.log("????????????,?????????!")
                return
            }
            if (nowPrice <= asLowPrice && !asStart) {
                autoSell(asAmount)
            }
        }, asTimes * 1000)
    }

    return (
        <HeaderFooter activeIndex={4}>
            <ToastContainer />
            <Head>
                <title>{t("title")}</title>
            </Head>
            <div className={styles.wrapper}>
                <div className={styles.user}>
                    <p>????????????:</p>
                    <table>
                        <thead>
                            <tr>
                                <th>??????</th>
                                <th>??????</th>
                                <th>??????</th>
                                <th>????????????</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balance.map((ele, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{ele.currency}</td>
                                        <td>{ele.available}</td>
                                        <td>{ele.frozen}</td>
                                        <td>{ele.total}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <div className={styles.list}>
                    <p>?????????</p>
                    <table>
                        <thead>
                            <tr>
                                <th>?????????</th>
                                <th>???????????????</th>
                            </tr>
                        </thead>
                        <tbody>
                            {price.map((ele, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{ele.symbol}</td>
                                        <td>{ele.price}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <p>????????????(??????????????????)</p>
                    <div className={styles.marker}>
                        <table>
                            <thead>
                                <tr>
                                    <th>?????????</th>
                                    <th>????????????</th>
                                    <th>????????????</th>
                                    <th>????????????(????????????????????????10U)</th>
                                    <th>????????????</th>
                                    <th>??????</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{symbol}</td>
                                    <td>
                                        <input step="0.0001" type="number" placeholder="??????????????????" value={bLowPrice} onChange={(e) => setBLowPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="??????????????????" value={bHighPrice} onChange={(e) => setBHighPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????????????????(??????????????????10U)" value={bAsset} onChange={(e) => setBAsset(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="??????????????????" value={bAmount} onChange={(e) => setBAmount(e.target.value)} />
                                    </td>
                                    <td>
                                        <button onClick={() => orderBuy()}>??????</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>????????????(??????????????????)</p>
                    <div className={styles.marker}>
                        <table>
                            <thead>
                                <tr>
                                    <th>?????????</th>
                                    <th>????????????</th>
                                    <th>????????????</th>
                                    <th>???????????????(????????????????????????10U)</th>
                                    <th>????????????</th>
                                    <th>??????</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{symbol}</td>
                                    <td>
                                        <input step="0.0001" type="number" placeholder="??????????????????" value={sLowPrice} onChange={(e) => setSLowPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="??????????????????" value={sHighPrice} onChange={(e) => setSHighPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="??????????????????????????????(??????????????????10U)" value={sAsset} onChange={(e) => setSAsset(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="??????????????????" value={sAmount} onChange={(e) => setSAmount(e.target.value)} />
                                    </td>
                                    <td>
                                        <button onClick={() => orderSell()}>??????</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>?????????????????????</p>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>?????????</th>
                                    <th>????????????</th>
                                    <th>????????????</th>
                                    <th>????????????(???)</th>
                                    <th>????????????</th>
                                    <th>??????</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{symbol}</td>
                                    <td>
                                        <input type="number" placeholder="????????????" value={aLowPrice} onChange={(e) => setALowPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????" value={aHighPrice} onChange={(e) => setAHighPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????(???)" value={aTimes} onChange={(e) => setATimes(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????" value={aAmount} onChange={(e) => setAAmount(e.target.value)} />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                setAStart(!aStart)
                                                autoStart()
                                            }}
                                        >
                                            {!aStart ? "??????" : "??????"}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>?????????????????????</p>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>?????????</th>
                                    <th>????????????</th>
                                    <th>????????????</th>
                                    <th>????????????(???)</th>
                                    <th>????????????</th>
                                    <th>??????</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{symbol}</td>
                                    <td>
                                        <input type="number" placeholder="????????????" value={asLowPrice} onChange={(e) => setAsLowPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????" value={asHighPrice} onChange={(e) => setAsHighPrice(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????(???)" value={asTimes} onChange={(e) => setAsTimes(e.target.value)} />
                                    </td>
                                    <td>
                                        <input type="number" placeholder="????????????" value={asAmount} onChange={(e) => setAsAmount(e.target.value)} />
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                setAsStart(!asStart)
                                                autosStart()
                                            }}
                                        >
                                            {!asStart ? "??????" : "??????"}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </HeaderFooter>
    )
}

Home.getInitialProps = async () => ({
  namespacesRequired: ["common", "header", "home"],
});

export default withTranslation("home")(withRouter(Home))
