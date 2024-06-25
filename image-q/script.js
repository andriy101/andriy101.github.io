const jsons = [
    'https://lottie.host/57a9824a-8c2c-4bd7-ae50-1fc0f3b241d0/QfngzjSqcQ.json',
    'https://lottie.host/acad25fa-b353-4c67-90b0-19ff1a577d88/wc7pr9MiqN.json',
    'https://lottie.host/dfa8330b-1820-4139-96ca-54668fd0f6c0/zQUpkpSKRV.json',
    'https://lottie.host/8b1d2830-0098-4858-85fa-c8752521b131/KFRQthSA7J.json',
    'https://lottie.host/988047e9-eff3-4715-a9dd-1171aa6e7e1f/hKMddm8tzr.json',
    'https://lottie.host/c27ce0df-bad6-4f48-82a0-d997a3bbb516/sItgwFPURC.json',
    'https://lottie.host/88b1df46-bfd6-43d5-adb4-8030d39ff4a2/qdt4wta8aO.json',
    'https://lottie.host/b2386ae4-78f2-428a-af31-14df5a4ee25d/Mnc9LAbOQn.json',
    'https://lottie.host/f1887599-692e-451f-a5e2-c0c9ded8e12a/TVwH8P6vhz.json',
    'https://lottie.host/d420b84a-dabc-4b8b-ba6e-45e07b8d1309/NSjdRrGwQA.json',
    '',
    '',
    '',
    '',
    '',
  ];
  const jsonsMap = jsons.reduce((res, curr) => ({
    ...res,
    [curr]: 1
  }), {});
  const template = document.querySelector('#player');
  
  const randomize = (ind) => {
    const ele = document.querySelector(`body > div:nth-child(${ind})`);
    ele.innerHTML = '';
    const availableSrcs = Object.keys({...jsonsMap});
    const randomSrc = availableSrcs.at(Math.floor(Math.random() * availableSrcs.length));
  
    if (randomSrc) {
      delete jsonsMap[randomSrc]; 
      const clone = template.content.cloneNode(true).firstElementChild;
      clone.src = randomSrc;
      ele.appendChild(clone);
    }
  
    setTimeout(() => {
      if (randomSrc) {
        jsonsMap[randomSrc] = 1;
      }
      randomize(ind);
    }, Math.floor(Math.random() * 7000) + 3000);
  };
  
  
  [...document.querySelectorAll('body > div')].forEach((_, ind) => randomize(ind + 1));
  