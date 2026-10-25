import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { Category } from './entities/category.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const nuevoProducto = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(nuevoProducto);
    
    if (savedProduct.stock > 0) {
      await this.movementRepository.save({
        productId: savedProduct.id,
        type: 'IN',
        quantity: savedProduct.stock,
        reason: 'Stock inicial (Creación)'
      });
    }

    return { message: '¡Producto guardado!', producto: savedProduct };
  }

  async findAll(user: any) {
    // 1. Obtenemos todos los usuarios activos
    const activeUsers = await this.userRepository.find({ where: { isActive: true } });
    
    // 2. Extraemos los storeId SOLO de los inquilinos (excluyendo superadmins y clientes)
    const activeStoreIds = activeUsers
      .filter(u => {
        const rol = (u.role || '').toLowerCase().replace(/_|-|\s/g, '');
        return rol !== 'superadmin' && rol !== 'customer' && u.storeId && u.storeId > 0;
      })
      .map(u => u.storeId);
    
    // Si no hay inquilinos activos, agregamos un valor inexistente para evitar que TypeORM falle
    if (activeStoreIds.length === 0) activeStoreIds.push(-1);

    // 3. Visitantes invitados: ven productos activos solo de tiendas activas
    if (!user) {
      return await this.productRepository.find({ 
        where: { isActive: true, storeId: In(activeStoreIds) } 
      });
    }

    const rol = (user.role || '').toLowerCase().replace(/_|-|\s/g, '');
    
    // 4. Superadmin ve TODA la base de datos (incluso tiendas suspendidas)
    if (rol === 'superadmin') { 
      return await this.productRepository.find();
    }

    // 5. Clientes registrados: ven lo mismo que los invitados
    if (rol === 'customer') {
      return await this.productRepository.find({ 
        where: { isActive: true, storeId: In(activeStoreIds) } 
      });
    }
    
    // 6. Inquilinos (sellers/admins de tienda): ven únicamente el inventario propio
    return await this.productRepository.find({ where: { storeId: user.storeId } });
  }

  async findOne(id: number) {
    const producto = await this.productRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`El producto con ID ${id} no existe`);
    }
    return producto;
  }

  async update(id: number, updateData: Partial<CreateProductDto>) {
    const productActual = await this.findOne(id); 
    
    if (updateData.price && Number(updateData.price) !== Number(productActual.price)) {
      await this.movementRepository.save({
        productId: productActual.id,
        type: 'PRICE',
        quantity: 0,
        reason: `Actualización de precio: Q${productActual.price} ➔ Q${updateData.price}`
      });
    }

    await this.productRepository.update(id, updateData); 
    return this.findOne(id); 
  }

  async toggleProductStatus(id: number) {
    const product = await this.findOne(id);
    product.isActive = !product.isActive;
    await this.productRepository.save(product);
    return { message: `Producto #${id} ahora está ${product.isActive ? 'Activo' : 'Retirado'}`, product };
  }

  async remove(id: number) {
    return this.toggleProductStatus(id);
  }

  async adjustStock(id: number, quantity: number, reason: string, operation: 'add' | 'subtract') {
    const product = await this.findOne(id);
    
    if (operation === 'subtract' && product.stock < quantity) {
      throw new BadRequestException('No hay suficiente stock para este retiro');
    }

    product.stock = operation === 'add' ? product.stock + quantity : product.stock - quantity;
    await this.productRepository.save(product);
    
    await this.movementRepository.save({
      productId: product.id,
      type: operation === 'add' ? 'IN' : 'OUT',
      quantity: quantity,
      reason: reason
    });

    return { message: `Se procesaron ${quantity} unidades. Motivo: ${reason}`, product };
  }

  async getMovements(productId: number) {
    return await this.movementRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' }
    });
  }

  async getAllMovements(user: any) {
    const rol = (user?.role || '').toLowerCase().replace(/_|-|\s/g, '');
    const isSuperAdmin = rol === 'superadmin';

    const movements = await this.movementRepository.find({ order: { createdAt: 'DESC' } });
    const products = await this.productRepository.find();
    
    return movements
      .map(mov => {
        const prod = products.find(p => p.id === mov.productId);
        return {
          ...mov,
          productName: prod ? prod.name : 'Desconocido',
          storeId: prod ? prod.storeId : null 
        };
      })
      .filter(mov => isSuperAdmin || mov.storeId === user.storeId);
  }

  async getCategories() {
    return await this.categoryRepository.find();
  }

  async createCategory(name: string) {
    const existe = await this.categoryRepository.findOneBy({ name });
    if (existe) throw new BadRequestException('La categoría ya existe');
    const nueva = this.categoryRepository.create({ name });
    return await this.categoryRepository.save(nueva);
  }

  async toggleCategoryStatus(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    category.isActive = !category.isActive;
    return await this.categoryRepository.save(category);
  }
}
