import puppeteer from 'puppeteer';

async function authentication(browser, user, password) {
  const page = await browser.newPage();

  await page.goto('https://suap.ifba.edu.br/accounts/login/');
  await page.waitForSelector('.login-form');

  await page.$eval('#id_username', (el, user) => (el.value = user), user);
  await page.$eval(
    '#id_password',
    (el, password) => (el.value = password),
    password
  );

  await page.click('.submit-row');

  await page.waitForNavigation();

  await page.close();
}

async function getDadosGerais(browser, matricula) {
  const page = await browser.newPage();

  await page.goto(`https://suap.ifba.edu.br/edu/aluno/${matricula}/`);

  await page.waitForSelector('#content');

  let dados_gerais = await page.evaluate(() => {
    let dadosEditar = document.querySelector(
      '#content > ul.action-bar > li:nth-child(1) > ul'
    ).children;
    let id_api = dadosEditar[0].children[0].getAttribute('href').split('/');
    let id_suap = dadosEditar[2].children[0].getAttribute('href').split('/');

    let dadosGerais = document.querySelector(
      '#content > div.box > div > div:nth-child(2) > table'
    ).children;
    dadosGerais = dadosGerais[0].children;

    let dadosCurso = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(3) > div > table'
    ).children;
    dadosCurso = dadosCurso[0].children;

    const result = {
      id_api: id_api[3],
      id_suap: id_suap[3],

      nome: dadosGerais[0].children[1].innerText,
      situacao: dadosGerais[0].children[3].innerText,

      cpf: dadosGerais[2].children[1].innerText,

      aluno_especial: dadosCurso[4].children[1].innerText,
    };

    return result;
  });

  await page.close();

  return dados_gerais;
}

async function getDadosAcademicos(browser, matricula) {
  const page = await browser.newPage();

  await page.goto(
    `https://suap.ifba.edu.br/edu/aluno/${matricula}/?tab=dados_academicos`
  );

  await page.waitForSelector('#content');

  let dados_academicos = await page.evaluate(() => {
    let dadosAcademicos = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(2) > div > table'
    ).children;
    dadosAcademicos = dadosAcademicos[0].children;

    let dadosCurso = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(3) > div > table'
    ).children;
    dadosCurso = dadosCurso[0].children;

    let dadosCota = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(4) > div > table'
    ).children;
    dadosCota = dadosCota[0].children;

    const result = {
      matricula: dadosAcademicos[0].children[1].innerText,
      data_matricula: dadosAcademicos[0].children[3].innerText,
      CRE: dadosAcademicos[0].children[5].innerText,

      observacao_matricula: dadosAcademicos[1].children[1].innerText,

      ano_ingresso: dadosAcademicos[3].children[1].innerText,
      periodo_ingresso: dadosAcademicos[3].children[3].innerText,
      periodo_referencia: dadosAcademicos[3].children[5].innerText,

      previsao_conclusao: dadosAcademicos[4].children[1].innerText,
      data_conclusao: dadosAcademicos[4].children[3].innerText,
      data_colacao: dadosAcademicos[4].children[5].innerText,

      data_expedicao_diploma: dadosAcademicos[5].children[1].innerText,
      data_migracao: dadosAcademicos[5].children[3].innerText,

      creditos: dadosAcademicos[6].children[1].innerText,

      linha_pesquisa: dadosCurso[3].children[1].innerText,

      cota_sistec: dadosCota[0].children[1].innerText,
      cota_mec: dadosCota[1].children[1].innerText,
    };

    return result;
  });

  await page.close();

  return dados_academicos;
}

async function getDadosCurso(browser, matricula) {
  const page = await browser.newPage();
  await page.goto(
    `https://suap.ifba.edu.br/edu/aluno/${matricula}/?tab=dados_academicos`
  );

  await page.waitForSelector('#content');

  let dados_curso = await page.evaluate(() => {
    let dadosCurso = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(3) > div > table'
    ).children;
    dadosCurso = dadosCurso[0].children;

    let curso_id = dadosCurso[2].children[1].innerText.split(' -');
    let curso_codigo = dadosCurso[0].children[1].innerText.split(' -');
    let curso_nome = dadosCurso[1].children[1].innerText.split(' (');

    const result = {
      id: curso_id[0],
      codigo: curso_codigo[0],
      nome: curso_nome[0],
    };

    return result;
  });

  await page.close();

  return dados_curso;
}

class ScrapingController {
  async getDados(request, response) {
    const { user, password } = request.query;
    const browser = await puppeteer.launch({ headless: false });

    await authentication(browser, user, password);

    let aluno = await getDadosGerais(browser, user);

    aluno.dados_academicos = await getDadosAcademicos(browser, user);

    aluno.curso = await getDadosCurso(browser, user);

    browser.close();

    response.json(aluno);
  }
}

export default new ScrapingController();
