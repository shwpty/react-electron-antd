## 项目技术栈

node18.17.0 + react@18.2.0 + electron@27.0.2 + webpack@5.64.4 + http2@3.3.7 + less@4.2.0 + antd@5.10.2 + bootstrap@4.4.1

## 项目运行

前提条件: node、npm、yarn安装

```
git clone --depth 1 https://github.com/xiaomantoua/react-electron-antd.git

cd react-electron-antd  //进入项目目录

yarn install  //安装依赖，成功后项目路径下生成node_modules

yarn package  //编译及打包,成功后项目路径下生成build及dist,dist中包含安装包及免安装版本

cd server && node http2s.js  //服务器端开启，这里端口是本地的9090端口,可通过constants.js中更改

运行NodeManagement.exe
```

## 前提条件(运行前请看)

### 1、node、npm环境的安装

js项目必须的工具，nodejs同时会安装npm，npm是js包管理器。

安装官网http://nodejs.cn/download/下载安装。

验证安装是否成功：`node -v   npm -v`

修改默认node_modules安装路径和node_cache缓存路径：

1、在nodejs目录下创建两个文件夹【node_global】和【node_cache】

![image](https://github.com/xiaomantoua/img_resource/blob/main/react-electron-antd/image-20230915131710044.png)

2、对两个文件夹设置所有权限

![image](https://github.com/xiaomantoua/img_resource/blob/main/react-electron-antd/image-20230915161158387.png)

之后cmd执行：

```
npm config set prefix "D:\Nodejs\node_global"  //路径替换为node安装路径

npm config set cache "D:\Nodejs\node_cache"  //路径替换为node安装路径
```

环境变量添加、镜像设置、安装cnpm（可选）

### 2、yarn安装

知识点：yarn和npm区别，包含第二节和第三节

yarn和npm一样是js包管理工具，用于管理JavaScript编写的软件包，**yarn可以弥补npm的一些缺陷**：

- 速度超快：Yarn 缓存了每个下载过的包，所以再次使用时无需重复下载。 同时利用并行下载以最大化资源利用率，因此安装速度更快。
- 超级安全：在执行代码之前，Yarn 会通过算法校验每个安装包的完整性。

**只要知道，yarn是对npm的优化，现在更多的使用yarn**

安装方法-全局安装：npm install -g yarn

验证是否成功：yarn -v 或者yarn --version

### 3、yarn和npm命令对比

|            npm             |                  yarn                   |
| :------------------------: | :-------------------------------------: |
|          npm init          |                yarn init                |
|        npm init -y         |              yarn init -y               |
|        npm install         |            yarn  //安装依赖             |
|      npm install xxx       |              yarn add xxx               |
|  npm install --global xxx  |  yarn global add xxx  //全局安装某模块  |
|     npm uninstall xxx      |       yarn remove xxx  //卸载依赖       |
|  npmm install xxx@版本号   |           yarn add xxx@版本号           |
|   npm install xxx --save   |              yarn add xxx               |
| npm install xxx --save-dev | yarn add xxx -dev  //仅开发环境安装依赖 |
|     npm update --save      |              yarn upgrade               |
|          npm run           |                yarn run                 |
|        npm run xxx         |              yarn run xxx               |
|        npm run dev         |                yarn dev                 |

(注：自行开发时可以添加rimraf工具，快速删除文件夹)

## 说明

此项目为基于c++的nghttp2库的非加密服务器端搭建适配的react+electron桌面应用。可供学习react及electron，交流+qq: 374267655，请加备注

**基本功能**

- 与服务器直接支持基于http2协议的消息交互
- 向服务器发起请求，根据响应消息展示集群节点状态等信息
- 监听服务器端的server push，实现节点扩缩容过程的动态展示

**技术点**

- 在react组件中无法直接使用http2库，而fetch和axios等方法针对非加密的服务器端无法使用(也可能因为本人菜鸟一枚)...在electron主进程中使用nodejs的http2库，以及和渲染进程(react组件)通信的方式完成对服务器端的请求及响应处理(曲线救国...)
- 对服务器端server push的处理，有参考[shumbo/node-http2-server-push-example: Send/receive HTTP/2 server push with Node.js (github.com)](https://github.com/shumbo/node-http2-server-push-example)

