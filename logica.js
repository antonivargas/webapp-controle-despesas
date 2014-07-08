var localDB = null;
 
function onInit(){
    try {
        if (!window.openDatabase) {
            updateStatus("Erro: Seu navegador não permite banco de dados.");
        }
        else {
            initDB();
            createTables();
            queryAndUpdateOverview();
        }
    } 
    catch (e) {
        if (e == 2) {
            updateStatus("Erro: Versão de banco de dados inválida.");
        }
        else {
            updateStatus("Erro: Erro desconhecido: " + e + ".");
        }
        return;
    }
}
 
function initDB(){
    var shortName = 'stuffDB';
    var version = '1.0';
    var displayName = 'MyStuffDB';
    var maxSize = 65536; // Em bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}
 
function createTables(){
    var query = 'CREATE TABLE IF NOT EXISTS tb_despesas(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, item VARCHAR NOT NULL, valor VARCHAR NOT NULL, data VARCHAR NOT NULL);';
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [], nullDataHandler, errorHandler);
            updateStatus("Tabela 'tb_despesas' status: OK.");
        });
    } 
    catch (e) {
        updateStatus("Erro: Data base 'tb_despesas' não criada " + e + ".");
        return;
    }
}

/* function dropTables(){
    var tabela = document.tb_despesasForm.id.value;
    var query = 'DROP TABLE '+tabela+';';
    try {
        localDB.transaction(function(transaction){
            transaction.executeSql(query, [], nullDataHandler, errorHandler);
            updateStatus("Tabela '"+tabela+"' Resetada com Sucesso!");
        });
    } 
    catch (e) {
        updateStatus("Erro: Data base '"+tabela+"' não Resetada " + e + ".");
        return;
    }
} */
 
 
 
 
//2. Query e visualização de Update
 
 
function onUpdate(){
    var id = document.itemForm.id.value;
    var item = document.itemForm.item.value;
    var valor = document.itemForm.valor.value;
    var data = document.itemForm.data.value;
    if (item == "" || valor == "") {
        updateStatus("'Item', 'Valor' e 'Data'  são campos obrigatórios!");
    }
    else {
        var query = "update tb_despesas set item=?, valor=?, data=? where id=?;";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [item, valor, data, id], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Alteração não realizada.");
                    }
                    else {
                        updateForm("", "", "");
                        updateStatus("Alteração realizada:" + results.rowsAffected);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: Alteração não realizada " + e + ".");
        }
    }
}
 
function onDelete(){
    var id = document.itemForm.id.value;
    
    var query = "delete from tb_despesas where id=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
                if (!results.rowsAffected) {
                    updateStatus("Erro: Exclusão não realizada.");
                }
                else {
                    updateForm("", "", "");
                    updateStatus("Item deletado:" + results.rowsAffected);
                    queryAndUpdateOverview();
                }
            }, errorHandler);
        });
    } 
    catch (e) {
        updateStatus("Erro: Exclusão não realizada " + e + ".");
    }
    
} 
 
function onCreate(){
    var item = document.itemForm.item.value;
    var valor = document.itemForm.valor.value;
    var data = document.itemForm.data.value;
    if (item == "" || valor == "" || data== "") {
        updateStatus("Erro: 'Item' e 'Valor' e 'Data' são campos obrigatórios!");
    }
    else {
        var query = "insert into tb_despesas (item, valor, data) VALUES (?, ?, ?);";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [item, valor,data], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Inserção não realizada");
                    }
                    else {
                        updateForm("", "", "");
                        updateStatus("Inserção realizada, linha id: " + results.insertId);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: Cadastro não realizado " + e + ".");
        }
    }
}
 
function onSelect(htmlLIElement){
	var id = htmlLIElement.getAttribute("id");
	
	query = "SELECT * FROM tb_despesas where id=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
            
                var row = results.rows.item(0);
                
                updateForm(row['id'], row['item'], row['valor'], row['data']);
                
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Não foi possível selecionar " + e + ".");
    }
   
}

 
function queryAndUpdateOverview(){
 
	//Remove as linhas existentes para inserção das novas
    var dataRows = document.getElementById("itemData").getElementsByClassName("data");
 
    while (dataRows.length > 0) {
        row = dataRows[0];
        document.getElementById("itemData").removeChild(row);
    };
 
	//Realiza a leitura no banco e cria novas linhas na tabela.
    var query = "SELECT * FROM tb_despesas;";
    try {
        localDB.transaction(function(transaction){
 
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
 
                    var row = results.rows.item(i);
                    var li = document.createElement("li");
					li.setAttribute("id", row['id']);
                    li.setAttribute("class", "data");
                    li.setAttribute("onclick", "onSelect(this)");
 
                    var liText = document.createTextNode(row['item'] + " R$ "+ row['valor']+" Data: "+row['data']);
                    li.appendChild(liText);
 
                    document.getElementById("itemData").appendChild(li);
                }
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: Não foi possível selecionar item " + e + ".");
    }
}
 
// 3. Funções de tratamento e status.
 
// Tratando erros
 
errorHandler = function(transaction, error){
    updateStatus("Erro: " + error.message);
    return true;
}
 
nullDataHandler = function(transaction, results){
}
 
// Funções de update

function updateForm(id, item, valor, data){
    document.itemForm.id.value = id;
    document.itemForm.item.value = item;
    document.itemForm.valor.value = valor;
	document.itemForm.data.value = data;
}

function updateStatus(status){
    document.getElementById('status').innerHTML = status;
}