import { useState } from 'react';
import "./scss/app.scss";
interface Ticket {
    type: number;
    name: string;
    desc: string;
    price: number;
    stock: number;
    count: number;
    peopleList: People[];
}
interface People {
    name: string;
    code: string;
    gender: number;
}

// 请求数据接口
const data = [
    { type: 1, name: '远程支持', desc: '可获得活动PPT等资料', price: 9.99, stock: 99 },
    { type: 2, name: '赞助商', desc: '获得品牌露出机会，详情联系...', price: 9.99, stock: 2 },
    { type: 3, name: '标准', desc: '可获得活动现场参加活动的机会', price: 0.99, stock: 99 }
]

// 组件函数
function App() {
    // 票种列表信息
    const [tickets, setTickets] = useState(data.map(item => {
        let priceList = String(item.price).split('.');
        let yuan = Number(priceList[0]);
        let fen = Number(priceList[1]);
        return {
            ...item,
            yuan,
            fen,
            count: 0,
            peopleList: []
        }
    }));
    // 购票人信息
    const [ticketBuyer, setTicketBuyer] = useState({
        phone: '',
        email: ''
    });
    // 总计票数
    const totalCount = () => {
        let count = 0;
        tickets.forEach(item => {
            count += item.count;
        });
        return count;
    };
    // 总计价格
    const totalPrice = () => {
        let price = 0;
        tickets.forEach(item => {
            price += item.count * item.price;
        });
        let priceList = price.toFixed(2).split('.');
        let yuan = priceList[0];
        let fen = priceList[1];
        return {
            yuan,
            fen
        };
    }
    // 增加/减少票数
    const handleOpt = (index: number, type: string) => {
        let ticket: Ticket = tickets[index];
        if (type === 'decrease') {
            if (ticket.count === 0) return;
            ticket.count -= 1;
            ticket.peopleList.pop();
        } else if (type === 'increase') {
            if (ticket.count >= ticket.stock) return;
            ticket.count += 1;
            let people: People = {
                name: '',
                code: '',
                gender: -1
            }
            ticket.peopleList.push(people);
        }
        setTickets(tickets.map(item => {
            if (ticket.type === item.type) {
                item = JSON.parse(JSON.stringify(ticket));
            }
            return item;
        }));
    };
    // 监听更改购票人信息
    const onChangeBuyer = (value: string, type: string) => {
        if (type === 'phone') {
            ticketBuyer.phone = value;
        } else if (type === 'email') {
            ticketBuyer.email = value;
        }
        setTicketBuyer(ticketBuyer);
    };
    // 监听更改参与人信息
    const onChangeInfo = (value: string|number, type: string, ticket: Ticket, itemIndex: number) => {
        setTickets(tickets.map(item => {
            if (ticket.type === item.type) {
                let people: People = item.peopleList[itemIndex];
                switch(type) {
                    case 'name':
                        people.name = String(value);
                        break;
                    case 'code':
                        people.code = String(value);
                        break;
                    case 'gender':
                        people.gender = Number(value);
                        break;
                }
                
            }
            return item;
        }));
    }
    // 立即支付
    const pay = () => {
        let { yuan, fen } = totalPrice();
        let price = Number(yuan) + (Math.round(Number(fen)) / 100);
        let users = [];
        if (!totalCount() || totalCount() <= 0) {
            alert('您还未选择票种');
            return;
        } else if (!ticketBuyer.phone || !ticketBuyer.email) {
            alert('请输入完整的购买者信息');
            return;
        }
        for(let i = 0;i < tickets.length;i++) {
            let item = tickets[i];
            for(let j = 0;j < item.peopleList.length;j++) {
                let people:People = item.peopleList[j];
                if (!people.name || !people.code || people.gender < 0) {
                    alert(`请输入完整的参与者【"${item.name}"票】第${j + 1}位信息`);
                    return;
                }
                users.push({
                    type: item.type,
                    price: item.price,
                    ...people
                });
            }
        }
        let params = {
            totalPrice: price,
            buyer: ticketBuyer,
            users: users
        }
        console.log('POST请求参数', params);
    };
    return (
        <div className="wrapper">
            <div className="box">
                <div className="label">选择票种</div>
                <div className="ticket-cells">
                    {
                        tickets.map((item, index) => {
                            return (
                                <div
                                    key={'ticket_' + index}
                                    className="ticket-cell"
                                >
                                    <div className="l">
                                        <div className="name">{item.name}</div>
                                        <div className="desc">{item.desc}</div>
                                        <div className="price">
                                            <span className="yuan">{item.yuan || 0}</span>
                                            <span className="fen">.{item.fen || 0}</span>
                                            <span className="unit">元</span>
                                            {
                                                item.stock < 10 ? (
                                                    <span className="stock">仅剩 {item.stock} 张</span>
                                                ) : null
                                            }
                                        </div>
                                    </div>
                                    <div className="r">
                                        <div
                                            className={item.count > 0 ? 'btn active' : 'btn'}
                                            onClick={() => handleOpt(index, 'decrease')}
                                        >
                                            <span className="icon-decrease"></span>
                                        </div>
                                        <div className="btn count">{item.count}</div>
                                        <div
                                            className={item.count < item.stock ? 'btn active' : 'btn'}
                                            onClick={ () => handleOpt(index, 'increase')}
                                        >
                                            <span className="icon-increase"></span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="box">
                <div className="label">购票人信息</div>
                <div className="form">
                    <div className="form-cell">
                        <div className="form-label">手机号</div>
                        <input
                            className="form-value"
                            type="number"
                            placeholder="请输入您的手机号，将用于接收出票短信"
                            onInput={(e: any) => onChangeBuyer(e.target.value, 'phone')}
                        />
                    </div>
                    <div className="form-cell">
                        <div className="form-label">电子邮箱</div>
                        <input
                            className="form-value"
                            type="email"
                            placeholder="请输入您的电子邮箱，将用于接收出票邮件"
                            onInput={(e: any) => onChangeBuyer(e.target.value, 'email')}
                        />
                    </div>
                </div>
            </div>
            {
                tickets.map((ticket: Ticket) => {
                    return (
                        <div key={'ticket_people_' + ticket.type}>
                            {
                                ticket.peopleList.map((item: any, index: number) => {
                                    return (
                                        <div
                                            key={'people_' + ticket.type + '_' + index}
                                            className="box"
                                        >
                                            <div className="label">
                                                参与者信息（“{ticket.name}”票第 {index + 1} 位）
                                            </div>
                                            <div className="form">
                                                <div className="form-cell">
                                                    <div className="form-label">姓名</div>
                                                    <input
                                                        className="form-value"
                                                        type="text"
                                                        value={item.name}
                                                        placeholder="请输入您的真实姓名"
                                                        onInput={(e: any) => onChangeInfo(e.target.value, 'name', ticket, index)}
                                                    />
                                                </div>
                                                <div className="form-cell">
                                                    <div className="form-label">身份证号</div>
                                                    <input
                                                        className="form-value"
                                                        type="text"
                                                        value={item.code}
                                                        placeholder="由于现场安保需要，请输入您的身份证号"
                                                        onInput={(e: any) => onChangeInfo(e.target.value, 'code', ticket, index) }
                                                    />
                                                </div>
                                                <div className="form-cell">
                                                    <div className="form-label">性别</div>
                                                    <div className="gender-cells">
                                                        <div
                                                            className="gender-cell"
                                                            onClick={() => onChangeInfo(1, 'gender', ticket, index)}
                                                        >
                                                            <span className={item.gender == 1 ? 'icon-select active' : 'icon-select'}></span>
                                                            <span>男性</span>
                                                        </div>
                                                        <div
                                                            className="gender-cell"
                                                            onClick={() => onChangeInfo(2, 'gender', ticket, index)}
                                                        >
                                                            <span className={item.gender == 2 ? 'icon-select active' : 'icon-select'}></span>
                                                            <span>女性</span>
                                                        </div>
                                                        <div
                                                            className="gender-cell"
                                                            onClick={() => onChangeInfo(3, 'gender', ticket, index)}
                                                        >
                                                            <span className={item.gender == 3 ? 'icon-select active' : 'icon-select'}></span>
                                                            <span>其他</span>
                                                        </div>
                                                        <div
                                                            className="gender-cell"
                                                            onClick={() => onChangeInfo(0, 'gender', ticket, index)}
                                                        >
                                                            <span className={item.gender == 0 ? 'icon-select active' : 'icon-select'}></span>
                                                            <span>不愿透露</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }
            <div className="footer">
                <div className="footer-l">
                    <div className="total">
                        <span>共</span>
                        <span className="count">{totalCount()}</span>
                        <span>张票</span>
                    </div>
                    <div className="price">
                        <span>合计</span>
                        <span className="yuan">{totalPrice().yuan}</span>
                        <span className="fen">.{totalPrice().fen}</span>
                        <span>元</span>
                    </div>
                </div>
                <div
                    className="btn-pay"
                    onClick={pay}
                >立即支付</div>
            </div>
        </div>
    );
}

export default App;
